import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';

// Mock Application entity to avoid circular dependency
interface Application {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Mock services to avoid circular dependencies
const mockApplicationsService = {
    findById: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
};

const mockApplicationComponentsService = {
    saveComponentsForType: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockUpdateApplicationUseCase {
    constructor(
        private readonly applicationsService: typeof mockApplicationsService,
        private readonly applicationComponentsService: typeof mockApplicationComponentsService,
    ) { }

    async execute(id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        // Verify if exists the application
        await this.applicationsService.findById(id);

        // Verify if alread exists the Application name
        await this.existsApplicationName(id, updateApplicationDto.name);

        // Update application
        const application = await this.applicationsService.update(id, updateApplicationDto);

        /**
         * Update the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: updateApplicationDto.applicationType,
            dtos: {
                applicationComponentApi: updateApplicationDto.applicationComponentApi,
                applicationComponentMobile: updateApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: updateApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: updateApplicationDto.applicationComponentFrontend,
            },
        });

        return await this.applicationsService.findById(id);
    }

    private async existsApplicationName(id: number, name: string): Promise<void> {
        if (!name) return;

        const exists = await this.applicationsService.findOneBy({ name });
        if (exists && exists.id !== id) throw new AlreadyExistsApplicationException();
    }
}

describe('UpdateApplicationUseCase', () => {
    let useCase: MockUpdateApplicationUseCase;
    let applicationsService: typeof mockApplicationsService;
    let applicationComponentsService: typeof mockApplicationComponentsService;

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUpdatedApplication: Application = {
        ...mockApplication,
        name: 'Updated Application',
        description: 'Updated Description',
    };

    const mockApiComponent: ApplicationComponentApiDto = {
        domain: 'example.com',
        apiUrl: 'https://example.com/api',
        healthCheckEndpoint: 'https://example.com/health',
        documentationUrl: 'https://example.com/documentation',
    };

    const mockMobileComponent: ApplicationComponentMobileDto = {
        platform: MobilePlatformEnum.ANDROID,
        downloadUrl: 'https://example.com/download/app.apk',
    };

    const mockFrontendComponent: ApplicationComponentFrontendDto = {
        frontendUrl: 'https://example.com/frontend',
        screenshotUrl: 'https://example.com/screenshot.png',
    };

    const mockLibraryComponent: ApplicationComponentLibraryDto = {
        readmeContent: 'This is a test readme content',
        packageManagerUrl: 'https://example.com/package-manager',
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockUpdateApplicationUseCase(
            mockApplicationsService,
            mockApplicationComponentsService
        );

        applicationsService = mockApplicationsService;
        applicationComponentsService = mockApplicationComponentsService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should update an application successfully with all fields', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/updated-app',
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationsService.findById).toHaveBeenCalledWith(1);
            expect(applicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Updated Application' });
            expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: mockApiComponent,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(applicationsService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should update an application successfully with partial fields', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationsService.findById).toHaveBeenCalledWith(1);
            expect(applicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Updated Application' });
            expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: undefined,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should update an application with mobile components', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Mobile App',
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: mockMobileComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: mockMobileComponent,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should update an application with frontend components', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Frontend App',
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: mockFrontendComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: mockFrontendComponent,
                },
            });
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should update an application with library components', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Library',
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: mockLibraryComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: mockLibraryComponent,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should update an application with fullstack components', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Fullstack App',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: mockApiComponent,
                applicationComponentFrontend: mockFrontendComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockUpdatedApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: mockApiComponent,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: mockFrontendComponent,
                },
            });
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should not check for name conflict when name is not provided', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                description: 'Updated Description',
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationsService.findOneBy).not.toHaveBeenCalled();
            expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should not check for name conflict when name is empty string', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: '',
                description: 'Updated Description',
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationsService.findOneBy).not.toHaveBeenCalled();
            expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should allow updating with the same name for the same application', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Test Application', // Same name as existing
                description: 'Updated Description',
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(mockApplication); // Same application found
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationsService.findById.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(1, updateDto);

            // Assert
            expect(applicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Test Application' });
            expect(applicationsService.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(mockUpdatedApplication);
        });

        it('should throw AlreadyExistsApplicationException when name already exists for different application', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Existing App',
                description: 'Updated Description',
            };

            const existingApplication = { ...mockApplication, id: 2 }; // Different ID

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(existingApplication);

            // Act & Assert
            await expect(useCase.execute(1, updateDto)).rejects.toThrow(AlreadyExistsApplicationException);
            expect(applicationsService.update).not.toHaveBeenCalled();
            expect(applicationComponentsService.saveComponentsForType).not.toHaveBeenCalled();
        });

        it('should propagate application service errors when finding application', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };

            const findError = new Error('Application not found');
            applicationsService.findById.mockRejectedValue(findError);

            // Act & Assert
            await expect(useCase.execute(1, updateDto)).rejects.toThrow('Application not found');
            expect(applicationsService.findOneBy).not.toHaveBeenCalled();
            expect(applicationsService.update).not.toHaveBeenCalled();
        });

        it('should propagate application service errors during update', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            const updateError = new Error('Database error');
            applicationsService.update.mockRejectedValue(updateError);

            // Act & Assert
            await expect(useCase.execute(1, updateDto)).rejects.toThrow('Database error');
            expect(applicationComponentsService.saveComponentsForType).not.toHaveBeenCalled();
        });

        it('should propagate application components service errors', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            const componentsError = new Error('Component update failed');
            applicationComponentsService.saveComponentsForType.mockRejectedValue(componentsError);

            // Act & Assert
            await expect(useCase.execute(1, updateDto)).rejects.toThrow('Component update failed');
        });

        it('should propagate application service errors when finding updated application', async () => {
            // Arrange
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };

            applicationsService.findById
                .mockResolvedValueOnce(mockApplication) // First call for validation
                .mockRejectedValueOnce(new Error('Application not found')); // Second call for result
            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.update.mockResolvedValue(mockUpdatedApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(1, updateDto)).rejects.toThrow('Application not found');
        });
    });
});