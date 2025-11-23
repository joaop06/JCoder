import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CreateMessageUseCase } from './create-message.use-case';
import { MessagesService } from '../messages.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../../../email/email.service';
import { CreateMessageDto } from '../dto/create-message.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../entities/message.entity', () => ({
    Message: class Message {},
}));

jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../messages.service', () => ({
    MessagesService: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
    })),
}));

jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../../../../email/email.service', () => ({
    EmailService: jest.fn().mockImplementation(() => ({
        sendEmail: jest.fn(),
    })),
}));

describe('CreateMessageUseCase', () => {
    let useCase: CreateMessageUseCase;
    let messagesService: MessagesService;
    let usersService: UsersService;
    let emailService: EmailService;
    let configService: ConfigService;

    const mockMessagesService = {
        create: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockEmailService = {
        sendEmail: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'admin@example.com',
        fullName: 'Admin User',
        firstName: 'Admin',
    };

    const mockCreateMessageDto: CreateMessageDto = {
        senderName: 'João Silva',
        senderEmail: 'joao@example.com',
        message: 'Test message content',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateMessageUseCase,
                {
                    provide: MessagesService,
                    useValue: mockMessagesService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        useCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
        messagesService = module.get<MessagesService>(MessagesService);
        usersService = module.get<UsersService>(UsersService);
        emailService = module.get<EmailService>(EmailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve criar mensagem e enviar email de notificação', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockMessagesService.create).toHaveBeenCalledWith(username, mockCreateMessageDto);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockConfigService.get).toHaveBeenCalledWith('FRONTEND_BASE_URL');
            expect(mockEmailService.sendEmail).toHaveBeenCalled();
        });

        it('deve criar mensagem mesmo quando usuário não tem email', async () => {
            const username = 'testuser';
            const userWithoutEmail = { ...mockUser, email: null };

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(userWithoutEmail);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockMessagesService.create).toHaveBeenCalledWith(username, mockCreateMessageDto);
            expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
        });

        it('deve criar mensagem mesmo quando envio de email falhar', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockRejectedValue(new Error('Email service error'));

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockMessagesService.create).toHaveBeenCalledWith(username, mockCreateMessageDto);
            expect(mockEmailService.sendEmail).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error sending notification email:',
                expect.any(Error),
            );

            consoleErrorSpy.mockRestore();
        });

        it('deve usar fullName quando disponível', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            const emailCall = mockEmailService.sendEmail.mock.calls[0];
            expect(emailCall).toBeDefined();
        });

        it('deve usar firstName quando fullName não disponível', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';
            const userWithFirstNameOnly = {
                ...mockUser,
                fullName: null,
                firstName: 'Admin',
            };

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(userWithFirstNameOnly);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockEmailService.sendEmail).toHaveBeenCalled();
        });

        it('deve usar username quando fullName e firstName não disponíveis', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';
            const userWithUsernameOnly = {
                ...mockUser,
                fullName: null,
                firstName: null,
            };

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(userWithUsernameOnly);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockEmailService.sendEmail).toHaveBeenCalled();
        });

        it('deve incluir portfolioUrl quando FRONTEND_BASE_URL está configurado', async () => {
            const username = 'testuser';
            const frontendBaseUrl = 'https://example.com';

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConfigService.get.mockReturnValue(frontendBaseUrl);
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockEmailService.sendEmail).toHaveBeenCalled();
            const emailCall = mockEmailService.sendEmail.mock.calls[0];
            expect(emailCall[1]).toContain('New message received on your portfolio');
        });

        it('não deve incluir portfolioUrl quando FRONTEND_BASE_URL não está configurado', async () => {
            const username = 'testuser';

            mockMessagesService.create.mockResolvedValue(undefined);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConfigService.get.mockReturnValue('');
            mockEmailService.sendEmail.mockResolvedValue(undefined);

            await useCase.execute(username, mockCreateMessageDto);

            expect(mockEmailService.sendEmail).toHaveBeenCalled();
        });
    });
});

