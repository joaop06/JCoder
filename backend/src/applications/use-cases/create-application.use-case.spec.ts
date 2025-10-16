import { Test, TestingModule } from '@nestjs/testing';
import { CreateApplicationUseCase } from './create-application.use-case';
import { UsersService } from '../../users/users.service';
import { ApplicationsService } from '../applications.service';
import { ApplicationComponentsService } from '../application-components/application-components.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { Application } from '../entities/application.entity';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';
import { RequiredApiComponentToApiApplication } from '../exceptions/required-api-component.exception';
import { RequiredMobileComponentToMobileApplication } from '../exceptions/required-mobile-component.exception';
import { RequiredFrontendComponentToApiApplication } from '../exceptions/required-frontend-component.exception';
import { RequiredLibraryComponentToLibraryApplication } from '../exceptions/required-library-component.exception';
import { RequiredApiAndFrontendComponentsToFullstackApplication } from '../exceptions/required-api-and-frontend-components.exception';

describe('CreateApplicationUseCase', () => {
    let useCase: CreateApplicationUseCase;
    let usersService: UsersService;
    let applicationsService: ApplicationsService;
    let applicationComponentsService: ApplicationComponentsService;

    const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'admin' as any,
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        userId: 1,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: mockUser,
    };

    const mockUsersService = {
        findById: jest.fn(),
    };

    const mockApplicationsService = {
        findOneBy: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
    };

    const mockApplicationComponentsService = {
        saveComponentsForType: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateApplicationUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
                {
                    provide: ApplicationComponentsService,
                    useValue: mockApplicationComponentsService,
                },
            ],
        }).compile();

        useCase = module.get<CreateApplicationUseCase>(CreateApplicationUseCase);
        usersService = module.get<UsersService>(UsersService);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        applicationComponentsService = module.get<ApplicationComponentsService>(ApplicationComponentsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create API application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API Application',
                userId: 1,
                description: 'Test API Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                    documentationUrl: 'https://api.example.com/docs',
                    healthCheckEndpoint: 'https://api.example.com/health',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockUsersService.findById).toHaveBeenCalledWith(1);
            expect(mockApplicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Test API Application' });
            expect(mockApplicationsService.create).toHaveBeenCalledWith(createDto);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: createDto.applicationComponentApi,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should create MOBILE application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Mobile Application',
                userId: 1,
                description: 'Test Mobile Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: {
                    platform: 'ANDROID',
                    packageName: 'com.example.app',
                    version: '1.0.0',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: createDto.applicationComponentMobile,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should create LIBRARY application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Library Application',
                userId: 1,
                description: 'Test Library Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: {
                    packageName: '@example/library',
                    version: '1.0.0',
                    repositoryUrl: 'https://github.com/example/library',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: createDto.applicationComponentLibrary,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should create FRONTEND application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Frontend Application',
                userId: 1,
                description: 'Test Frontend Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: {
                    domain: 'app.example.com',
                    url: 'https://app.example.com',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: createDto.applicationComponentFrontend,
                },
            });
        });

        it('should create FULLSTACK application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack Application',
                userId: 1,
                description: 'Test Fullstack Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
                applicationComponentFrontend: {
                    domain: 'app.example.com',
                    url: 'https://app.example.com',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: createDto.applicationComponentApi,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: createDto.applicationComponentFrontend,
                },
            });
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Application',
                userId: 999,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockUsersService.findById.mockRejectedValue(new UserNotFoundException());

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(UserNotFoundException);
            expect(mockUsersService.findById).toHaveBeenCalledWith(999);
            expect(mockApplicationsService.findOneBy).not.toHaveBeenCalled();
        });

        it('should throw AlreadyExistsApplicationException when application name already exists', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Existing Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(mockApplication);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(AlreadyExistsApplicationException);
            expect(mockApplicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Existing Application' });
        });
    });

    describe('validateDetailsForType', () => {
        it('should throw RequiredApiComponentToApiApplication for API without component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API Application',
                userId: 1,
                description: 'Test API Description',
                applicationType: ApplicationTypeEnum.API,
                // Missing applicationComponentApi
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiComponentToApiApplication);
        });

        it('should throw RequiredMobileComponentToMobileApplication for MOBILE without component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Mobile Application',
                userId: 1,
                description: 'Test Mobile Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                // Missing applicationComponentMobile
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredMobileComponentToMobileApplication);
        });

        it('should throw RequiredFrontendComponentToApiApplication for FRONTEND without component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Frontend Application',
                userId: 1,
                description: 'Test Frontend Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                // Missing applicationComponentFrontend
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredFrontendComponentToApiApplication);
        });

        it('should throw RequiredLibraryComponentToLibraryApplication for LIBRARY without component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Library Application',
                userId: 1,
                description: 'Test Library Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                // Missing applicationComponentLibrary
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredLibraryComponentToLibraryApplication);
        });

        it('should throw RequiredApiAndFrontendComponentsToFullstackApplication for FULLSTACK without API component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack Application',
                userId: 1,
                description: 'Test Fullstack Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentFrontend: {
                    domain: 'app.example.com',
                    url: 'https://app.example.com',
                },
                // Missing applicationComponentApi
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
        });

        it('should throw RequiredApiAndFrontendComponentsToFullstackApplication for FULLSTACK without Frontend component', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack Application',
                userId: 1,
                description: 'Test Fullstack Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
                // Missing applicationComponentFrontend
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
        });

        it('should throw RequiredApiAndFrontendComponentsToFullstackApplication for FULLSTACK without both components', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack Application',
                userId: 1,
                description: 'Test Fullstack Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                // Missing both applicationComponentApi and applicationComponentFrontend
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors during application creation', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow('Database error');
        });

        it('should handle errors during component creation', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockRejectedValue(new Error('Component creation error'));

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow('Component creation error');
        });

        it('should handle errors during final application retrieval', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockUsersService.findById.mockResolvedValue(mockUser);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);
            mockApplicationsService.findById.mockRejectedValue(new Error('Retrieval error'));

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow('Retrieval error');
        });
    });
});
