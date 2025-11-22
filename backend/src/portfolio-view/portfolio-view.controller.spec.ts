import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioViewController } from './portfolio-view.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { CreateMessageUseCase } from '../administration-by-user/messages/use-cases/create-message.use-case';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case';
import { GetReferencesUseCase } from './use-cases/get-references.use-case';
import { GetExperiencesUseCase } from './use-cases/get-experiences.use-case';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case';
import { GetCertificatesUseCase } from './use-cases/get-certificates.use-case';
import { GetTechnologiesUseCase } from './use-cases/get-technologies.use-case';
import { VerifyEmailCodeUseCase } from './use-cases/verify-email-code.use-case';
import { GetApplicationDetailsUseCase } from './use-cases/get-application-details.use-case';
import { GetProfileWithAboutMeUseCase } from './use-cases/get-profile-with-about-me.use-case';
import { RegisterPortfolioViewUseCase } from './use-cases/register-portfolio-view.use-case';
import { SendEmailVerificationUseCase } from './use-cases/send-email-verification.use-case';
import { CheckEmailAvailabilityUseCase } from './use-cases/check-email-availability.use-case';
import { CheckUsernameAvailabilityUseCase } from './use-cases/check-username-availability.use-case';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateMessageDto } from '../administration-by-user/messages/dto/create-message.dto';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { RegisterPortfolioViewDto } from './dto/register-portfolio-view.dto';
import { PaginationDto } from '../@common/dto/pagination.dto';
import { UserNotFoundException } from '../administration-by-user/users/exceptions/user-not-found.exception';
import { EmailAlreadyExistsException } from '../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../administration-by-user/users/exceptions/username-already-exists.exception';
import { ApplicationNotFoundException } from '../administration-by-user/applications/exceptions/application-not-found.exception';

// Mock das entidades
jest.mock('../administration-by-user/users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos use cases
jest.mock('./use-cases/create-user.use-case', () => ({
    CreateUserUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/check-username-availability.use-case', () => ({
    CheckUsernameAvailabilityUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/check-email-availability.use-case', () => ({
    CheckEmailAvailabilityUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/send-email-verification.use-case', () => ({
    SendEmailVerificationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/verify-email-code.use-case', () => ({
    VerifyEmailCodeUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-profile-with-about-me.use-case', () => ({
    GetProfileWithAboutMeUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-educations.use-case', () => ({
    GetEducationsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-experiences.use-case', () => ({
    GetExperiencesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-certificates.use-case', () => ({
    GetCertificatesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-applications.use-case', () => ({
    GetApplicationsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-application-details.use-case', () => ({
    GetApplicationDetailsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-references.use-case', () => ({
    GetReferencesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-technologies.use-case', () => ({
    GetTechnologiesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/register-portfolio-view.use-case', () => ({
    RegisterPortfolioViewUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('../administration-by-user/messages/use-cases/create-message.use-case', () => ({
    CreateMessageUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

import { User } from '../administration-by-user/users/entities/user.entity';

describe('PortfolioViewController', () => {
    let controller: PortfolioViewController;
    let createUserUseCase: CreateUserUseCase;
    let checkUsernameAvailabilityUseCase: CheckUsernameAvailabilityUseCase;
    let checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase;
    let sendEmailVerificationUseCase: SendEmailVerificationUseCase;
    let verifyEmailCodeUseCase: VerifyEmailCodeUseCase;
    let getProfileWithAboutMeUseCase: GetProfileWithAboutMeUseCase;
    let createMessageUseCase: CreateMessageUseCase;

    const mockCreateUserUseCase = { execute: jest.fn() };
    const mockCheckUsernameAvailabilityUseCase = { execute: jest.fn() };
    const mockCheckEmailAvailabilityUseCase = { execute: jest.fn() };
    const mockSendEmailVerificationUseCase = { execute: jest.fn() };
    const mockVerifyEmailCodeUseCase = { execute: jest.fn() };
    const mockGetProfileWithAboutMeUseCase = { execute: jest.fn() };
    const mockGetEducationsUseCase = { execute: jest.fn() };
    const mockGetExperiencesUseCase = { execute: jest.fn() };
    const mockGetCertificatesUseCase = { execute: jest.fn() };
    const mockGetApplicationsUseCase = { execute: jest.fn() };
    const mockGetApplicationDetailsUseCase = { execute: jest.fn() };
    const mockGetReferencesUseCase = { execute: jest.fn() };
    const mockGetTechnologiesUseCase = { execute: jest.fn() };
    const mockRegisterPortfolioViewUseCase = { execute: jest.fn() };
    const mockCreateMessageUseCase = { execute: jest.fn() };

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PortfolioViewController],
            providers: [
                { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
                { provide: CheckUsernameAvailabilityUseCase, useValue: mockCheckUsernameAvailabilityUseCase },
                { provide: CheckEmailAvailabilityUseCase, useValue: mockCheckEmailAvailabilityUseCase },
                { provide: SendEmailVerificationUseCase, useValue: mockSendEmailVerificationUseCase },
                { provide: VerifyEmailCodeUseCase, useValue: mockVerifyEmailCodeUseCase },
                { provide: GetProfileWithAboutMeUseCase, useValue: mockGetProfileWithAboutMeUseCase },
                { provide: GetEducationsUseCase, useValue: mockGetEducationsUseCase },
                { provide: GetExperiencesUseCase, useValue: mockGetExperiencesUseCase },
                { provide: GetCertificatesUseCase, useValue: mockGetCertificatesUseCase },
                { provide: GetApplicationsUseCase, useValue: mockGetApplicationsUseCase },
                { provide: GetApplicationDetailsUseCase, useValue: mockGetApplicationDetailsUseCase },
                { provide: GetReferencesUseCase, useValue: mockGetReferencesUseCase },
                { provide: GetTechnologiesUseCase, useValue: mockGetTechnologiesUseCase },
                { provide: RegisterPortfolioViewUseCase, useValue: mockRegisterPortfolioViewUseCase },
                { provide: CreateMessageUseCase, useValue: mockCreateMessageUseCase },
            ],
        }).compile();

        controller = module.get<PortfolioViewController>(PortfolioViewController);
        createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        checkUsernameAvailabilityUseCase = module.get<CheckUsernameAvailabilityUseCase>(
            CheckUsernameAvailabilityUseCase,
        );
        checkEmailAvailabilityUseCase = module.get<CheckEmailAvailabilityUseCase>(
            CheckEmailAvailabilityUseCase,
        );
        sendEmailVerificationUseCase = module.get<SendEmailVerificationUseCase>(
            SendEmailVerificationUseCase,
        );
        verifyEmailCodeUseCase = module.get<VerifyEmailCodeUseCase>(VerifyEmailCodeUseCase);
        getProfileWithAboutMeUseCase = module.get<GetProfileWithAboutMeUseCase>(
            GetProfileWithAboutMeUseCase,
        );
        createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkUsernameAvailability', () => {
        it('deve verificar disponibilidade de username', async () => {
            const username = 'testuser';
            const result = { available: true, username };

            mockCheckUsernameAvailabilityUseCase.execute.mockResolvedValue(result);

            const response = await controller.checkUsernameAvailability(username);

            expect(response).toEqual(result);
            expect(mockCheckUsernameAvailabilityUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('checkEmailAvailability', () => {
        it('deve verificar disponibilidade de email', async () => {
            const email = 'test@example.com';
            const result = { available: true, email };

            mockCheckEmailAvailabilityUseCase.execute.mockResolvedValue(result);

            const response = await controller.checkEmailAvailability(email);

            expect(response).toEqual(result);
            expect(mockCheckEmailAvailabilityUseCase.execute).toHaveBeenCalledWith(email);
        });
    });

    describe('sendEmailVerification', () => {
        it('deve enviar código de verificação', async () => {
            const dto: SendEmailVerificationDto = { email: 'test@example.com' };
            const result = { message: 'Verification code sent successfully' };

            mockSendEmailVerificationUseCase.execute.mockResolvedValue(result);

            const response = await controller.sendEmailVerification(dto);

            expect(response).toEqual(result);
            expect(mockSendEmailVerificationUseCase.execute).toHaveBeenCalledWith(dto);
        });

        it('deve lançar exceção quando email já existe', async () => {
            const dto: SendEmailVerificationDto = { email: 'existing@example.com' };

            mockSendEmailVerificationUseCase.execute.mockRejectedValue(
                new EmailAlreadyExistsException(),
            );

            await expect(controller.sendEmailVerification(dto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );
        });
    });

    describe('verifyEmailCode', () => {
        it('deve verificar código de email', async () => {
            const dto: VerifyEmailCodeDto = { email: 'test@example.com', code: '123456' };
            const result = { verified: true, message: 'Email verified successfully' };

            mockVerifyEmailCodeUseCase.execute.mockResolvedValue(result);

            const response = await controller.verifyEmailCode(dto);

            expect(response).toEqual(result);
            expect(mockVerifyEmailCodeUseCase.execute).toHaveBeenCalledWith(dto);
        });
    });

    describe('createUser', () => {
        it('deve criar novo usuário', async () => {
            const createUserDto: CreateUserDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                fullName: 'Test User',
            };

            mockCreateUserUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.createUser(createUserDto);

            expect(result).toEqual(mockUser);
            expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
        });

        it('deve lançar exceção quando email já existe', async () => {
            const createUserDto: CreateUserDto = {
                username: 'testuser',
                email: 'existing@example.com',
                password: 'password123',
            };

            mockCreateUserUseCase.execute.mockRejectedValue(new EmailAlreadyExistsException());

            await expect(controller.createUser(createUserDto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );
        });

        it('deve lançar exceção quando username já existe', async () => {
            const createUserDto: CreateUserDto = {
                username: 'existinguser',
                email: 'test@example.com',
                password: 'password123',
            };

            mockCreateUserUseCase.execute.mockRejectedValue(new UsernameAlreadyExistsException());

            await expect(controller.createUser(createUserDto)).rejects.toThrow(
                UsernameAlreadyExistsException,
            );
        });
    });

    describe('createMessage', () => {
        it('deve criar mensagem', async () => {
            const username = 'testuser';
            const createMessageDto: CreateMessageDto = {
                senderName: 'John Doe',
                senderEmail: 'john@example.com',
                message: 'Test message',
            };

            mockCreateMessageUseCase.execute.mockResolvedValue(undefined);

            await controller.createMessage(username, createMessageDto);

            expect(mockCreateMessageUseCase.execute).toHaveBeenCalledWith(username, createMessageDto);
        });
    });

    describe('getProfileWithAboutMe', () => {
        it('deve retornar perfil com about me', async () => {
            const username = 'testuser';
            const result = {
                id: 1,
                username: 'testuser',
                firstName: 'Test',
                userComponentAboutMe: {},
            };

            mockGetProfileWithAboutMeUseCase.execute.mockResolvedValue(result);

            const response = await controller.getProfileWithAboutMe(username);

            expect(response).toEqual(result);
            expect(mockGetProfileWithAboutMeUseCase.execute).toHaveBeenCalledWith(username);
        });

        it('deve lançar exceção quando usuário não encontrado', async () => {
            const username = 'nonexistent';

            mockGetProfileWithAboutMeUseCase.execute.mockRejectedValue(
                new UserNotFoundException(),
            );

            await expect(controller.getProfileWithAboutMe(username)).rejects.toThrow(
                UserNotFoundException,
            );
        });
    });

    describe('getEducations', () => {
        it('deve retornar educações', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetEducationsUseCase.execute.mockResolvedValue(result);

            const response = await controller.getEducations(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetEducationsUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getExperiences', () => {
        it('deve retornar experiências', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetExperiencesUseCase.execute.mockResolvedValue(result);

            const response = await controller.getExperiences(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetExperiencesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getCertificates', () => {
        it('deve retornar certificados', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetCertificatesUseCase.execute.mockResolvedValue(result);

            const response = await controller.getCertificates(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetCertificatesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getApplications', () => {
        it('deve retornar aplicações', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetApplicationsUseCase.execute.mockResolvedValue(result);

            const response = await controller.getApplications(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetApplicationsUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getApplicationDetails', () => {
        it('deve retornar detalhes da aplicação', async () => {
            const username = 'testuser';
            const id = 1;
            const result = { id: 1, name: 'App Name' };

            mockGetApplicationDetailsUseCase.execute.mockResolvedValue(result);

            const response = await controller.getApplicationDetails(username, id);

            expect(response).toEqual(result);
            expect(mockGetApplicationDetailsUseCase.execute).toHaveBeenCalledWith(id, username);
        });

        it('deve lançar exceção quando aplicação não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockGetApplicationDetailsUseCase.execute.mockRejectedValue(
                new ApplicationNotFoundException(),
            );

            await expect(controller.getApplicationDetails(username, id)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });
    });

    describe('getReferences', () => {
        it('deve retornar referências', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetReferencesUseCase.execute.mockResolvedValue(result);

            const response = await controller.getReferences(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetReferencesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getTechnologies', () => {
        it('deve retornar tecnologias', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const result = { data: [], meta: {} as any };

            mockGetTechnologiesUseCase.execute.mockResolvedValue(result);

            const response = await controller.getTechnologies(username, paginationDto);

            expect(response).toEqual(result);
            expect(mockGetTechnologiesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('registerPortfolioView', () => {
        it('deve registrar visualização do portfólio', async () => {
            const username = 'testuser';
            const dto: RegisterPortfolioViewDto = { referrer: 'https://example.com' };
            const request = { ip: '127.0.0.1', headers: {} } as any;

            mockRegisterPortfolioViewUseCase.execute.mockResolvedValue(undefined);

            await controller.registerPortfolioView(username, dto, request);

            expect(mockRegisterPortfolioViewUseCase.execute).toHaveBeenCalledWith(
                username,
                dto,
                request,
            );
        });
    });
});

