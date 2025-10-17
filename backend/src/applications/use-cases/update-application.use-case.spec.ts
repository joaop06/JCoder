import { Test, TestingModule } from '@nestjs/testing';
import { UpdateApplicationUseCase } from './update-application.use-case';
import { ApplicationsService } from '../applications.service';
import { ApplicationComponentsService } from '../application-components/application-components.service';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { Application } from '../entities/application.entity';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationNotFoundException } from '../exceptions/application-not-found.exception';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';

describe('UpdateApplicationUseCase', () => {
    let useCase: UpdateApplicationUseCase;
    let applicationsService: ApplicationsService;
    let applicationComponentsService: ApplicationComponentsService;

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
        user: {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'admin' as any,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    };

    const mockApplicationsService = {
        findById: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
    };

    const mockApplicationComponentsService = {
        saveComponentsForType: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateApplicationUseCase,
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

        useCase = module.get<UpdateApplicationUseCase>(UpdateApplicationUseCase);
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
        it('should update application successfully with all fields', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                githubUrl: 'https://github.com/test/updated-app',
                applicationComponentMobile: {
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: 'https://example.mobile.com/download/2.0.0',
                },
            };

            const updatedApplication = { ...mockApplication, ...updateDto };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Updated Application' });
            expect(mockApplicationsService.update).toHaveBeenCalledWith(applicationId, updateDto);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: updatedApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: updateDto.applicationComponentMobile,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should update application successfully with partial fields', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name Only',
            };

            const updatedApplication = { ...mockApplication, name: 'Updated Name Only' };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationsService.update).toHaveBeenCalledWith(applicationId, updateDto);
        });

        it('should update application successfully with empty update object', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {};

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.update).toHaveBeenCalledWith(applicationId, updateDto);
        });

        it('should update application with API component', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'updated-api.example.com',
                    apiUrl: 'https://updated-api.example.com/v1',
                    documentationUrl: 'https://updated-api.example.com/docs',
                    healthCheckEndpoint: 'https://updated-api.example.com/health',
                },
            };

            const updatedApplication = { ...mockApplication, ...updateDto };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: updatedApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: updateDto.applicationComponentApi,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should update application with FRONTEND component', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: {
                    frontendUrl: 'https://updated-app.example.com',
                    screenshotUrl: 'https://updated-app.example.com/screenshot',
                },
            };

            const updatedApplication = { ...mockApplication, ...updateDto };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: updatedApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: updateDto.applicationComponentFrontend,
                },
            });
        });

        it('should update application with LIBRARY component', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: {
                    packageManagerUrl: 'https://www.npmjs.com/package/@example/updated-library',
                    readmeContent: 'Updated library description',
                },
            };

            const updatedApplication = { ...mockApplication, ...updateDto };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: updatedApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: updateDto.applicationComponentLibrary,
                    applicationComponentFrontend: undefined,
                },
            });
        });

        it('should update application with FULLSTACK components', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: {
                    domain: 'updated-api.example.com',
                    apiUrl: 'https://updated-api.example.com/v1',
                },
                applicationComponentFrontend: {
                    frontendUrl: 'https://updated-app.example.com',
                    screenshotUrl: 'https://updated-app.example.com/screenshot',
                },
            };

            const updatedApplication = { ...mockApplication, ...updateDto };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationsService.findById.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockApplicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: updatedApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: updateDto.applicationComponentApi,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: updateDto.applicationComponentFrontend,
                },
            });
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name',
            };

            mockApplicationsService.findById.mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId, updateDto)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId);
            expect(mockApplicationsService.findOneBy).not.toHaveBeenCalled();
        });

        it('should throw AlreadyExistsApplicationException when name already exists for different application', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Existing Application Name',
            };

            const existingApplication = { ...mockApplication, id: 2, name: 'Existing Application Name' };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(existingApplication);

            // Act & Assert
            await expect(useCase.execute(applicationId, updateDto)).rejects.toThrow(AlreadyExistsApplicationException);
            expect(mockApplicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Existing Application Name' });
        });

        it('should not throw AlreadyExistsApplicationException when name exists for same application', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Test Application', // Same name as current application
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Test Application' });
        });

        it('should not check name uniqueness when name is not provided', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                description: 'Updated Description',
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findOneBy).not.toHaveBeenCalled();
        });

        it('should not check name uniqueness when name is null', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: null,
                description: 'Updated Description',
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findOneBy).not.toHaveBeenCalled();
        });

        it('should not check name uniqueness when name is undefined', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: undefined,
                description: 'Updated Description',
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(applicationId, updateDto);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findOneBy).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors during application update', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name',
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.update.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(useCase.execute(applicationId, updateDto)).rejects.toThrow('Database error');
        });

        it('should handle errors during component update', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockRejectedValue(new Error('Component update error'));

            // Act & Assert
            await expect(useCase.execute(applicationId, updateDto)).rejects.toThrow('Component update error');
        });

        it('should handle errors during final application retrieval', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name',
            };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.findOneBy.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);
            mockApplicationsService.findById.mockRejectedValue(new Error('Retrieval error'));

            // Act & Assert
            await expect(useCase.execute(applicationId, updateDto)).rejects.toThrow('Retrieval error');
        });
    });
});
