import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { GetAboutMeUseCase, UpdateAboutMeUseCase } from './user-components/use-cases/about-me.use-case';
import { GetEducationsUseCase, CreateEducationUseCase, UpdateEducationUseCase, DeleteEducationUseCase } from './user-components/use-cases/education.use-case';
import { GetExperiencesUseCase, CreateExperienceUseCase, UpdateExperienceUseCase, DeleteExperienceUseCase } from './user-components/use-cases/experience.use-case';
import { GetCertificatesUseCase, CreateCertificateUseCase, UpdateCertificateUseCase, DeleteCertificateUseCase } from './user-components/use-cases/certificate.use-case';
import { GetReferencesUseCase, CreateReferenceUseCase, UpdateReferenceUseCase, DeleteReferenceUseCase } from './user-components/use-cases/reference.use-case';
import { LinkCertificateToEducationUseCase, UnlinkCertificateFromEducationUseCase } from './user-components/use-cases/link-certificate-education.use-case';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UnauthorizedAccessException } from './exceptions/unauthorized-access.exception';
import { EmailAlreadyExistsException } from './exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from './exceptions/username-already-exists.exception';
import { InvalidCurrentPasswordException } from './exceptions/invalid-current-password.exception';
import { ComponentNotFoundException } from './user-components/exceptions/component-not-found.exceptions';

// Mock das entidades para evitar dependências circulares
jest.mock('./entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos use cases antes de importar
jest.mock('./use-cases/get-profile.use-case', () => ({
    GetProfileUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/update-profile.use-case', () => ({
    UpdateProfileUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/about-me.use-case', () => ({
    GetAboutMeUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UpdateAboutMeUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/education.use-case', () => ({
    GetEducationsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    CreateEducationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UpdateEducationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    DeleteEducationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/experience.use-case', () => ({
    GetExperiencesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    CreateExperienceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UpdateExperienceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    DeleteExperienceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/certificate.use-case', () => ({
    GetCertificatesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    CreateCertificateUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UpdateCertificateUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    DeleteCertificateUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/reference.use-case', () => ({
    GetReferencesUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    CreateReferenceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UpdateReferenceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    DeleteReferenceUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./user-components/use-cases/link-certificate-education.use-case', () => ({
    LinkCertificateToEducationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
    UnlinkCertificateFromEducationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

import { User } from './entities/user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let getProfileUseCase: GetProfileUseCase;
    let updateProfileUseCase: UpdateProfileUseCase;
    let getAboutMeUseCase: GetAboutMeUseCase;
    let updateAboutMeUseCase: UpdateAboutMeUseCase;

    const mockGetProfileUseCase = { execute: jest.fn() };
    const mockUpdateProfileUseCase = { execute: jest.fn() };
    const mockGetAboutMeUseCase = { execute: jest.fn() };
    const mockUpdateAboutMeUseCase = { execute: jest.fn() };
    const mockGetEducationsUseCase = { execute: jest.fn() };
    const mockCreateEducationUseCase = { execute: jest.fn() };
    const mockUpdateEducationUseCase = { execute: jest.fn() };
    const mockDeleteEducationUseCase = { execute: jest.fn() };
    const mockGetExperiencesUseCase = { execute: jest.fn() };
    const mockCreateExperienceUseCase = { execute: jest.fn() };
    const mockUpdateExperienceUseCase = { execute: jest.fn() };
    const mockDeleteExperienceUseCase = { execute: jest.fn() };
    const mockGetCertificatesUseCase = { execute: jest.fn() };
    const mockCreateCertificateUseCase = { execute: jest.fn() };
    const mockUpdateCertificateUseCase = { execute: jest.fn() };
    const mockDeleteCertificateUseCase = { execute: jest.fn() };
    const mockGetReferencesUseCase = { execute: jest.fn() };
    const mockCreateReferenceUseCase = { execute: jest.fn() };
    const mockUpdateReferenceUseCase = { execute: jest.fn() };
    const mockDeleteReferenceUseCase = { execute: jest.fn() };
    const mockLinkCertificateToEducationUseCase = { execute: jest.fn() };
    const mockUnlinkCertificateFromEducationUseCase = { execute: jest.fn() };

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        fullName: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
                { provide: UpdateProfileUseCase, useValue: mockUpdateProfileUseCase },
                { provide: GetAboutMeUseCase, useValue: mockGetAboutMeUseCase },
                { provide: UpdateAboutMeUseCase, useValue: mockUpdateAboutMeUseCase },
                { provide: GetEducationsUseCase, useValue: mockGetEducationsUseCase },
                { provide: CreateEducationUseCase, useValue: mockCreateEducationUseCase },
                { provide: UpdateEducationUseCase, useValue: mockUpdateEducationUseCase },
                { provide: DeleteEducationUseCase, useValue: mockDeleteEducationUseCase },
                { provide: GetExperiencesUseCase, useValue: mockGetExperiencesUseCase },
                { provide: CreateExperienceUseCase, useValue: mockCreateExperienceUseCase },
                { provide: UpdateExperienceUseCase, useValue: mockUpdateExperienceUseCase },
                { provide: DeleteExperienceUseCase, useValue: mockDeleteExperienceUseCase },
                { provide: GetCertificatesUseCase, useValue: mockGetCertificatesUseCase },
                { provide: CreateCertificateUseCase, useValue: mockCreateCertificateUseCase },
                { provide: UpdateCertificateUseCase, useValue: mockUpdateCertificateUseCase },
                { provide: DeleteCertificateUseCase, useValue: mockDeleteCertificateUseCase },
                { provide: GetReferencesUseCase, useValue: mockGetReferencesUseCase },
                { provide: CreateReferenceUseCase, useValue: mockCreateReferenceUseCase },
                { provide: UpdateReferenceUseCase, useValue: mockUpdateReferenceUseCase },
                { provide: DeleteReferenceUseCase, useValue: mockDeleteReferenceUseCase },
                { provide: LinkCertificateToEducationUseCase, useValue: mockLinkCertificateToEducationUseCase },
                { provide: UnlinkCertificateFromEducationUseCase, useValue: mockUnlinkCertificateFromEducationUseCase },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        getProfileUseCase = module.get<GetProfileUseCase>(GetProfileUseCase);
        updateProfileUseCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
        getAboutMeUseCase = module.get<GetAboutMeUseCase>(GetAboutMeUseCase);
        updateAboutMeUseCase = module.get<UpdateAboutMeUseCase>(UpdateAboutMeUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('deve retornar perfil do usuário', async () => {
            const username = 'testuser';

            mockGetProfileUseCase.execute.mockResolvedValue(mockUser);

            const result = await controller.getProfile(username);

            expect(result).toEqual(mockUser);
            expect(mockGetProfileUseCase.execute).toHaveBeenCalledWith(username);
        });

        it('deve lançar exceção quando usuário não encontrado', async () => {
            const username = 'nonexistent';

            mockGetProfileUseCase.execute.mockRejectedValue(new UserNotFoundException());

            await expect(controller.getProfile(username)).rejects.toThrow(UserNotFoundException);
        });
    });

    describe('updateProfile', () => {
        it('deve atualizar perfil do usuário', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                firstName: 'Updated',
            };
            const updatedUser = { ...mockUser, ...updateDto };

            mockUpdateProfileUseCase.execute.mockResolvedValue(updatedUser);

            const result = await controller.updateProfile(username, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith(username, updateDto);
        });

        it('deve lançar exceção quando email já existe', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                email: 'existing@example.com',
            };

            mockUpdateProfileUseCase.execute.mockRejectedValue(new EmailAlreadyExistsException());

            await expect(controller.updateProfile(username, updateDto)).rejects.toThrow(
                EmailAlreadyExistsException,
            );
        });

        it('deve lançar exceção quando username já existe', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                username: 'existinguser',
            };

            mockUpdateProfileUseCase.execute.mockRejectedValue(new UsernameAlreadyExistsException());

            await expect(controller.updateProfile(username, updateDto)).rejects.toThrow(
                UsernameAlreadyExistsException,
            );
        });

        it('deve lançar exceção quando senha atual inválida', async () => {
            const username = 'testuser';
            const updateDto: UpdateProfileDto = {
                currentPassword: 'wrong',
                newPassword: 'newpass',
            };

            mockUpdateProfileUseCase.execute.mockRejectedValue(
                new InvalidCurrentPasswordException(),
            );

            await expect(controller.updateProfile(username, updateDto)).rejects.toThrow(
                InvalidCurrentPasswordException,
            );
        });
    });

    describe('getAboutMe', () => {
        it('deve retornar about me', async () => {
            const username = 'testuser';
            const mockAboutMe = { id: 1, content: 'About me content' };

            mockGetAboutMeUseCase.execute.mockResolvedValue(mockAboutMe);

            const result = await controller.getAboutMe(username);

            expect(result).toEqual(mockAboutMe);
            expect(mockGetAboutMeUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('updateAboutMe', () => {
        it('deve atualizar about me', async () => {
            const username = 'testuser';
            const updateDto = { content: 'Updated content' };
            const updatedAboutMe = { id: 1, ...updateDto };

            mockUpdateAboutMeUseCase.execute.mockResolvedValue(updatedAboutMe);

            const result = await controller.updateAboutMe(username, updateDto);

            expect(result).toEqual(updatedAboutMe);
            expect(mockUpdateAboutMeUseCase.execute).toHaveBeenCalledWith(username, updateDto);
        });

        it('deve lançar exceção quando componente não encontrado', async () => {
            const username = 'testuser';
            const updateDto = { content: 'Updated content' };

            mockUpdateAboutMeUseCase.execute.mockRejectedValue(
                new ComponentNotFoundException(),
            );

            await expect(controller.updateAboutMe(username, updateDto)).rejects.toThrow(
                ComponentNotFoundException,
            );
        });
    });

    describe('getEducations', () => {
        it('deve retornar lista paginada de educações', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<any> = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockGetEducationsUseCase.execute.mockResolvedValue(mockResponse);

            const result = await controller.getEducations(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockGetEducationsUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('createEducation', () => {
        it('deve criar uma nova educação', async () => {
            const username = 'testuser';
            const createDto = { institution: 'University', degree: 'Bachelor' };
            const createdEducation = { id: 1, ...createDto };

            mockCreateEducationUseCase.execute.mockResolvedValue(createdEducation);

            const result = await controller.createEducation(username, createDto);

            expect(result).toEqual(createdEducation);
            expect(mockCreateEducationUseCase.execute).toHaveBeenCalledWith(username, createDto);
        });
    });

    describe('updateEducation', () => {
        it('deve atualizar uma educação', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDto = { degree: 'Master' };
            const updatedEducation = { id, ...updateDto };

            mockUpdateEducationUseCase.execute.mockResolvedValue(updatedEducation);

            const result = await controller.updateEducation(username, id, updateDto);

            expect(result).toEqual(updatedEducation);
            expect(mockUpdateEducationUseCase.execute).toHaveBeenCalledWith(id, updateDto);
        });
    });

    describe('deleteEducation', () => {
        it('deve deletar uma educação', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteEducationUseCase.execute.mockResolvedValue(undefined);

            await controller.deleteEducation(username, id);

            expect(mockDeleteEducationUseCase.execute).toHaveBeenCalledWith(id);
        });
    });

    describe('getExperiences', () => {
        it('deve retornar lista paginada de experiências', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<any> = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockGetExperiencesUseCase.execute.mockResolvedValue(mockResponse);

            const result = await controller.getExperiences(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockGetExperiencesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('createExperience', () => {
        it('deve criar uma nova experiência', async () => {
            const username = 'testuser';
            const createDto = { company: 'Company', position: 'Developer' };
            const createdExperience = { id: 1, ...createDto };

            mockCreateExperienceUseCase.execute.mockResolvedValue(createdExperience);

            const result = await controller.createExperience(username, createDto);

            expect(result).toEqual(createdExperience);
            expect(mockCreateExperienceUseCase.execute).toHaveBeenCalledWith(username, createDto);
        });
    });

    describe('getCertificates', () => {
        it('deve retornar lista paginada de certificados', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<any> = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockGetCertificatesUseCase.execute.mockResolvedValue(mockResponse);

            const result = await controller.getCertificates(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockGetCertificatesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('linkCertificateToEducation', () => {
        it('deve vincular certificado a educação', async () => {
            const username = 'testuser';
            const certificateId = 1;
            const educationId = 2;

            mockLinkCertificateToEducationUseCase.execute.mockResolvedValue(undefined);

            await controller.linkCertificateToEducation(username, certificateId, educationId);

            expect(mockLinkCertificateToEducationUseCase.execute).toHaveBeenCalledWith(
                username,
                certificateId,
                educationId,
            );
        });
    });

    describe('unlinkCertificateFromEducation', () => {
        it('deve desvincular certificado de educação', async () => {
            const username = 'testuser';
            const certificateId = 1;
            const educationId = 2;

            mockUnlinkCertificateFromEducationUseCase.execute.mockResolvedValue(undefined);

            await controller.unlinkCertificateFromEducation(username, certificateId, educationId);

            expect(mockUnlinkCertificateFromEducationUseCase.execute).toHaveBeenCalledWith(
                username,
                certificateId,
                educationId,
            );
        });
    });

    describe('getReferences', () => {
        it('deve retornar lista paginada de referências', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<any> = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockGetReferencesUseCase.execute.mockResolvedValue(mockResponse);

            const result = await controller.getReferences(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockGetReferencesUseCase.execute).toHaveBeenCalledWith(username, paginationDto);
        });
    });
});

