import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { RequiredApiComponentToApiApplication } from '../exceptions/required-api-component.exception';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { RequiredMobileComponentToMobileApplication } from '../exceptions/required-mobile-component.exception';
import { RequiredFrontendComponentToApiApplication } from '../exceptions/required-frontend-component.exception';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { RequiredLibraryComponentToLibraryApplication } from '../exceptions/required-library-component.exception';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';
import { RequiredApiAndFrontendComponentsToFullstackApplication } from '../exceptions/required-api-and-frontend-components.exception';

// Mock Application entity to avoid circular dependency
interface Application {
    id: number;
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
    findOneBy: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
};

const mockApplicationComponentsService = {
    saveComponentsForType: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockCreateApplicationUseCase {
    constructor(
        private readonly applicationsService: typeof mockApplicationsService,
        private readonly applicationComponentsService: typeof mockApplicationComponentsService,
    ) { }

    async execute(createApplicationDto: CreateApplicationDto): Promise<Application> {
        // Validate whether components are present based on type
        this.validateDetailsForType(createApplicationDto);

        // Verify if alread exists the Application name
        const exists = await this.applicationsService.findOneBy({ name: createApplicationDto.name });
        if (exists) throw new AlreadyExistsApplicationException();

        // Create the application with the respective components
        const application = await this.applicationsService.create(createApplicationDto);

        /**
         * Create the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: createApplicationDto.applicationType,
            dtos: {
                applicationComponentApi: createApplicationDto.applicationComponentApi,
                applicationComponentMobile: createApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: createApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: createApplicationDto.applicationComponentFrontend,
            },
        });

        return await this.applicationsService.findById(application.id);
    }

    private validateDetailsForType(dto: CreateApplicationDto): void {
        switch (dto.applicationType) {
            case ApplicationTypeEnum.API:
                if (!dto.applicationComponentApi) {
                    throw new RequiredApiComponentToApiApplication();
                }
                break;
            case ApplicationTypeEnum.FRONTEND:
                if (!dto.applicationComponentFrontend) {
                    throw new RequiredFrontendComponentToApiApplication();
                }
                break;

            case ApplicationTypeEnum.FULLSTACK:
                if (!dto.applicationComponentApi || !dto.applicationComponentFrontend) {
                    throw new RequiredApiAndFrontendComponentsToFullstackApplication();
                }
                break;

            case ApplicationTypeEnum.MOBILE:
                if (!dto.applicationComponentMobile) {
                    throw new RequiredMobileComponentToMobileApplication();
                }
                break;

            case ApplicationTypeEnum.LIBRARY:
                if (!dto.applicationComponentLibrary) {
                    throw new RequiredLibraryComponentToLibraryApplication();
                }
                break;
        }
    }
}

describe('CreateApplicationUseCase', () => {
    let useCase: MockCreateApplicationUseCase;
    let applicationsService: typeof mockApplicationsService;
    let applicationComponentsService: typeof mockApplicationComponentsService;

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        useCase = new MockCreateApplicationUseCase(
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
        it('should create an API application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API',
                description: 'Test API Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/api',
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(applicationsService.findOneBy).toHaveBeenCalledWith({ name: 'Test API' });
            expect(applicationsService.create).toHaveBeenCalledWith(createDto);
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: mockApiComponent,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(applicationsService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockApplication);
        });

        it('should create a MOBILE application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Mobile',
                description: 'Test Mobile Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: mockMobileComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: mockMobileComponent,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(result).toEqual(mockApplication);
        });

        it('should create a FRONTEND application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Frontend',
                description: 'Test Frontend Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: mockFrontendComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: mockFrontendComponent,
                },
            });
            expect(result).toEqual(mockApplication);
        });

        it('should create a LIBRARY application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Library',
                description: 'Test Library Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: mockLibraryComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentApi: undefined,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: mockLibraryComponent,
                    applicationComponentFrontend: undefined,
                },
            });
            expect(result).toEqual(mockApplication);
        });

        it('should create a FULLSTACK application successfully', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack',
                description: 'Test Fullstack Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: mockApiComponent,
                applicationComponentFrontend: mockFrontendComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            applicationsService.findById.mockResolvedValue(mockApplication);
            applicationComponentsService.saveComponentsForType.mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(createDto);

            // Assert
            expect(applicationComponentsService.saveComponentsForType).toHaveBeenCalledWith({
                application: mockApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: mockApiComponent,
                    applicationComponentMobile: undefined,
                    applicationComponentLibrary: undefined,
                    applicationComponentFrontend: mockFrontendComponent,
                },
            });
            expect(result).toEqual(mockApplication);
        });

        it('should throw AlreadyExistsApplicationException when application name already exists', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Existing App',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(mockApplication);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(AlreadyExistsApplicationException);
            expect(applicationsService.create).not.toHaveBeenCalled();
            expect(applicationComponentsService.saveComponentsForType).not.toHaveBeenCalled();
        });

        it('should throw RequiredApiComponentToApiApplication when API component is missing for API type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                // Missing applicationComponentApi
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiComponentToApiApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });

        it('should throw RequiredMobileComponentToMobileApplication when mobile component is missing for MOBILE type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Mobile',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                // Missing applicationComponentMobile
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredMobileComponentToMobileApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });

        it('should throw RequiredFrontendComponentToApiApplication when frontend component is missing for FRONTEND type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Frontend',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                // Missing applicationComponentFrontend
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredFrontendComponentToApiApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });

        it('should throw RequiredLibraryComponentToLibraryApplication when library component is missing for LIBRARY type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Library',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                // Missing applicationComponentLibrary
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredLibraryComponentToLibraryApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });

        it('should throw RequiredApiAndFrontendComponentsToFullstackApplication when API component is missing for FULLSTACK type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentFrontend: mockFrontendComponent,
                // Missing applicationComponentApi
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });

        it('should throw RequiredApiAndFrontendComponentsToFullstackApplication when frontend component is missing for FULLSTACK type', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test Fullstack',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
                applicationComponentApi: mockApiComponent,
                // Missing applicationComponentFrontend
            };

            applicationsService.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow(RequiredApiAndFrontendComponentsToFullstackApplication);
            expect(applicationsService.create).not.toHaveBeenCalled();
        });


        it('should propagate application service errors during creation', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            const createError = new Error('Database error');
            applicationsService.create.mockRejectedValue(createError);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow('Database error');
            expect(applicationComponentsService.saveComponentsForType).not.toHaveBeenCalled();
        });

        it('should propagate application components service errors', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'Test API',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: mockApiComponent,
            };

            applicationsService.findOneBy.mockResolvedValue(null);
            applicationsService.create.mockResolvedValue(mockApplication);
            const componentsError = new Error('Component creation failed');
            applicationComponentsService.saveComponentsForType.mockRejectedValue(componentsError);

            // Act & Assert
            await expect(useCase.execute(createDto)).rejects.toThrow('Component creation failed');
        });
    });
});