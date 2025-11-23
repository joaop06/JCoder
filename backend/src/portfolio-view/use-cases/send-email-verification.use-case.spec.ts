import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendEmailVerificationUseCase } from './send-email-verification.use-case';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../administration-by-user/users/users.service';
import { SendEmailVerificationDto } from '../dto/send-email-verification.dto';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';

// Mock das entidades
jest.mock('../entities/email-verification.entity', () => ({
    EmailVerification: class EmailVerification {},
}));

// Mock dos serviços
jest.mock('../../email/email.service', () => ({
    EmailService: jest.fn().mockImplementation(() => ({
        sendEmail: jest.fn(),
    })),
}));

jest.mock('../../administration-by-user/users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        existsBy: jest.fn(),
    })),
}));

import { EmailVerification } from '../entities/email-verification.entity';

describe('SendEmailVerificationUseCase', () => {
    let useCase: SendEmailVerificationUseCase;
    let emailService: EmailService;
    let usersService: UsersService;
    let emailVerificationRepository: Repository<EmailVerification>;

    const mockEmailService = {
        sendEmail: jest.fn(),
    };

    const mockUsersService = {
        existsBy: jest.fn(),
    };

    const mockEmailVerificationRepository = {
        delete: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockSendEmailVerificationDto: SendEmailVerificationDto = {
        email: 'test@example.com',
    };

    const mockEmailVerification: EmailVerification = {
        id: 1,
        email: 'test@example.com',
        code: '123456',
        verified: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
    } as EmailVerification;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendEmailVerificationUseCase,
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: getRepositoryToken(EmailVerification),
                    useValue: mockEmailVerificationRepository,
                },
            ],
        }).compile();

        useCase = module.get<SendEmailVerificationUseCase>(SendEmailVerificationUseCase);
        emailService = module.get<EmailService>(EmailService);
        usersService = module.get<UsersService>(UsersService);
        emailVerificationRepository = module.get<Repository<EmailVerification>>(
            getRepositoryToken(EmailVerification),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve enviar código de verificação com sucesso', async () => {
            mockUsersService.existsBy.mockResolvedValue(false);
            mockEmailVerificationRepository.delete.mockResolvedValue({ affected: 0 });
            mockEmailVerificationRepository.create.mockReturnValue(mockEmailVerification);
            mockEmailVerificationRepository.save.mockResolvedValue(mockEmailVerification);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            const result = await useCase.execute(mockSendEmailVerificationDto);

            expect(result.message).toBe('Verification code sent successfully');
            expect(mockUsersService.existsBy).toHaveBeenCalledWith({
                email: mockSendEmailVerificationDto.email,
            });
            expect(mockEmailVerificationRepository.delete).toHaveBeenCalledWith({
                email: mockSendEmailVerificationDto.email,
                verified: false,
            });
            expect(mockEmailVerificationRepository.create).toHaveBeenCalled();
            expect(mockEmailVerificationRepository.save).toHaveBeenCalled();
            expect(mockEmailService.sendEmail).toHaveBeenCalled();
        });

        it('deve lançar exceção quando email já existe', async () => {
            mockUsersService.existsBy.mockResolvedValue(true);

            await expect(useCase.execute(mockSendEmailVerificationDto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );

            expect(mockEmailVerificationRepository.create).not.toHaveBeenCalled();
            expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
        });

        it('deve gerar código de 6 dígitos', async () => {
            mockUsersService.existsBy.mockResolvedValue(false);
            mockEmailVerificationRepository.delete.mockResolvedValue({ affected: 0 });
            mockEmailVerificationRepository.create.mockReturnValue(mockEmailVerification);
            mockEmailVerificationRepository.save.mockResolvedValue(mockEmailVerification);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(mockSendEmailVerificationDto);

            const createCall = mockEmailVerificationRepository.create.mock.calls[0][0];
            expect(createCall.code).toMatch(/^\d{6}$/);
        });

        it('deve definir expiração de 15 minutos', async () => {
            const now = new Date();
            mockUsersService.existsBy.mockResolvedValue(false);
            mockEmailVerificationRepository.delete.mockResolvedValue({ affected: 0 });
            mockEmailVerificationRepository.create.mockReturnValue(mockEmailVerification);
            mockEmailVerificationRepository.save.mockResolvedValue(mockEmailVerification);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(mockSendEmailVerificationDto);

            const createCall = mockEmailVerificationRepository.create.mock.calls[0][0];
            const expiresAt = new Date(createCall.expiresAt);
            const expectedExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);

            // Verifica que a expiração está aproximadamente 15 minutos no futuro (com margem de 1 segundo)
            expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiresAt.getTime() - 1000);
            expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiresAt.getTime() + 1000);
        });

        it('deve deletar verificação quando envio de email falhar', async () => {
            const error = new Error('Email service error');

            mockUsersService.existsBy.mockResolvedValue(false);
            mockEmailVerificationRepository.delete.mockResolvedValue({ affected: 0 });
            mockEmailVerificationRepository.create.mockReturnValue(mockEmailVerification);
            mockEmailVerificationRepository.save.mockResolvedValue(mockEmailVerification);
            mockEmailService.sendEmail.mockRejectedValue(error);

            await expect(useCase.execute(mockSendEmailVerificationDto)).rejects.toThrow(error);

            expect(mockEmailVerificationRepository.delete).toHaveBeenCalledWith({
                id: mockEmailVerification.id,
            });
        });

        it('deve remover verificações antigas não verificadas', async () => {
            mockUsersService.existsBy.mockResolvedValue(false);
            mockEmailVerificationRepository.delete.mockResolvedValue({ affected: 2 });
            mockEmailVerificationRepository.create.mockReturnValue(mockEmailVerification);
            mockEmailVerificationRepository.save.mockResolvedValue(mockEmailVerification);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(mockSendEmailVerificationDto);

            expect(mockEmailVerificationRepository.delete).toHaveBeenCalledWith({
                email: mockSendEmailVerificationDto.email,
                verified: false,
            });
        });
    });
});

