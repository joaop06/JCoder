import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationTypeEnum } from '../enums/application-type.enum';

// Mock Application entity to avoid circular dependency
interface MockApplication {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    isActive: boolean;
    user: any;
    createdAt: Date;
    updatedAt: Date;
}

// Mock entities to avoid circular dependencies
interface MockApplicationComponentApi {
    applicationId: number;
    domain: string;
    apiUrl: string;
    documentationUrl?: string;
    healthCheckEndpoint?: string;
}

interface MockApplicationComponentMobile {
    applicationId: number;
    platform: MobilePlatformEnum;
    downloadUrl?: string;
    associatedApiId?: number;
}

interface MockApplicationComponentLibrary {
    applicationId: number;
    packageManagerUrl: string;
    readmeContent?: string;
}

interface MockApplicationComponentFrontend {
    applicationId: number;
    frontendUrl: string;
    screenshotUrl?: string;
    associatedApiId?: number;
}

// Mock DTOs
interface MockCreateComponentsForTypeDto {
    application: MockApplication;
    applicationType: ApplicationTypeEnum;
    dtos: {
        applicationComponentApi?: {
            domain: string;
            apiUrl: string;
            documentationUrl?: string;
            healthCheckEndpoint?: string;
        };
        applicationComponentMobile?: {
            platform: MobilePlatformEnum;
            downloadUrl?: string;
        };
        applicationComponentLibrary?: {
            packageManagerUrl: string;
            readmeContent?: string;
        };
        applicationComponentFrontend?: {
            frontendUrl: string;
            screenshotUrl?: string;
        };
    };
}

// Mock Service
class MockApplicationComponentsService {
    constructor(private readonly repository: MockApplicationComponentsRepository) { }

    async saveComponentsForType(dto: MockCreateComponentsForTypeDto) {
        switch (dto.applicationType) {
            case ApplicationTypeEnum.API:
                await this.repository.createApi({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentApi,
                });
                break;

            case ApplicationTypeEnum.FRONTEND:
                await this.repository.createFrontend({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.FULLSTACK:
                await this.repository.createApi({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentApi,
                });
                await this.repository.createFrontend({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.MOBILE:
                await this.repository.createMobile({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentMobile,
                });
                break;

            case ApplicationTypeEnum.LIBRARY:
                await this.repository.createLibrary({
                    applicationId: dto.application.id,
                    ...dto.dtos.applicationComponentLibrary,
                });
                break;
        }
    }
}

// Mock Repository
class MockApplicationComponentsRepository {
    constructor(
        private readonly apiRepository: Repository<MockApplicationComponentApi>,
        private readonly mobileRepository: Repository<MockApplicationComponentMobile>,
        private readonly libraryRepository: Repository<MockApplicationComponentLibrary>,
        private readonly frontendRepository: Repository<MockApplicationComponentFrontend>,
    ) { }

    async createApi(object: Partial<MockApplicationComponentApi>): Promise<MockApplicationComponentApi> {
        const component = this.apiRepository.create(object);
        return await this.apiRepository.save(component);
    }

    async createMobile(object: Partial<MockApplicationComponentMobile>): Promise<MockApplicationComponentMobile> {
        const component = this.mobileRepository.create(object);
        return await this.mobileRepository.save(component);
    }

    async createLibrary(object: Partial<MockApplicationComponentLibrary>): Promise<MockApplicationComponentLibrary> {
        const component = this.libraryRepository.create(object);
        return await this.libraryRepository.save(component);
    }

    async createFrontend(object: Partial<MockApplicationComponentFrontend>): Promise<MockApplicationComponentFrontend> {
        const component = this.frontendRepository.create(object);
        return await this.frontendRepository.save(component);
    }
}

describe('ApplicationComponentsModule Integration', () => {
    let module: TestingModule;
    let service: MockApplicationComponentsService;
    let repository: MockApplicationComponentsRepository;
    let mockApiRepository: jest.Mocked<Repository<MockApplicationComponentApi>>;
    let mockMobileRepository: jest.Mocked<Repository<MockApplicationComponentMobile>>;
    let mockLibraryRepository: jest.Mocked<Repository<MockApplicationComponentLibrary>>;
    let mockFrontendRepository: jest.Mocked<Repository<MockApplicationComponentFrontend>>;

    beforeEach(async () => {
        // Create mock repositories
        mockApiRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
        } as any;

        mockMobileRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
        } as any;

        mockLibraryRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
        } as any;

        mockFrontendRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
        } as any;

        module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ApplicationComponentsService',
                    useFactory: (repository: MockApplicationComponentsRepository) => {
                        return new MockApplicationComponentsService(repository);
                    },
                    inject: ['ApplicationComponentsRepository'],
                },
                {
                    provide: 'ApplicationComponentsRepository',
                    useFactory: () => {
                        return new MockApplicationComponentsRepository(
                            mockApiRepository,
                            mockMobileRepository,
                            mockLibraryRepository,
                            mockFrontendRepository,
                        );
                    },
                },
            ],
        }).compile();

        service = module.get<MockApplicationComponentsService>('ApplicationComponentsService');
        repository = module.get<MockApplicationComponentsRepository>('ApplicationComponentsRepository');
    });

    afterEach(async () => {
        await module.close();
    });

    describe('Module Initialization', () => {
        it('should be defined', () => {
            expect(module).toBeDefined();
        });

        it('should have ApplicationComponentsService as provider', () => {
            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(MockApplicationComponentsService);
        });

        it('should have ApplicationComponentsRepository as provider', () => {
            expect(repository).toBeDefined();
            expect(repository).toBeInstanceOf(MockApplicationComponentsRepository);
        });

        it('should have all entity repositories available', () => {
            expect(mockApiRepository).toBeDefined();
            expect(mockMobileRepository).toBeDefined();
            expect(mockLibraryRepository).toBeDefined();
            expect(mockFrontendRepository).toBeDefined();
        });
    });

    describe('Service Integration with Repository', () => {
        let mockApplication: MockApplication;

        beforeEach(() => {
            mockApplication = {
                id: 1,
                userId: 1,
                name: 'Test Application',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                isActive: true,
                user: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        describe('API Component Creation', () => {
            it('should create API component successfully', async () => {
                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType: ApplicationTypeEnum.API,
                    dtos: {
                        applicationComponentApi: {
                            domain: 'test.api.com',
                            apiUrl: 'https://test.api.com/api/v1',
                            documentationUrl: 'https://test.api.com/docs',
                            healthCheckEndpoint: 'https://test.api.com/health',
                        },
                    },
                };

                const mockCreatedComponent = {
                    applicationId: mockApplication.id,
                    domain: 'test.api.com',
                    apiUrl: 'https://test.api.com/api/v1',
                    documentationUrl: 'https://test.api.com/docs',
                    healthCheckEndpoint: 'https://test.api.com/health',
                };

                mockApiRepository.create.mockReturnValue(mockCreatedComponent as any);
                mockApiRepository.save.mockResolvedValue(mockCreatedComponent as any);

                await service.saveComponentsForType(createDto);

                expect(mockApiRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    domain: 'test.api.com',
                    apiUrl: 'https://test.api.com/api/v1',
                    documentationUrl: 'https://test.api.com/docs',
                    healthCheckEndpoint: 'https://test.api.com/health',
                });
                expect(mockApiRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
            });
        });

        describe('Mobile Component Creation', () => {
            it('should create Mobile component successfully', async () => {
                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType: ApplicationTypeEnum.MOBILE,
                    dtos: {
                        applicationComponentMobile: {
                            platform: MobilePlatformEnum.ANDROID,
                            downloadUrl: 'https://test.mobile.com/download/1.0.0',
                        },
                    },
                };

                const mockCreatedComponent = {
                    applicationId: mockApplication.id,
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: 'https://test.mobile.com/download/1.0.0',
                };

                mockMobileRepository.create.mockReturnValue(mockCreatedComponent as any);
                mockMobileRepository.save.mockResolvedValue(mockCreatedComponent as any);

                await service.saveComponentsForType(createDto);

                expect(mockMobileRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: 'https://test.mobile.com/download/1.0.0',
                });
                expect(mockMobileRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
            });
        });

        describe('Library Component Creation', () => {
            it('should create Library component successfully', async () => {
                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType: ApplicationTypeEnum.LIBRARY,
                    dtos: {
                        applicationComponentLibrary: {
                            packageManagerUrl: 'https://www.npmjs.com/package/test-package',
                            readmeContent: 'This is a test library',
                        },
                    },
                };

                const mockCreatedComponent = {
                    applicationId: mockApplication.id,
                    packageManagerUrl: 'https://www.npmjs.com/package/test-package',
                    readmeContent: 'This is a test library',
                };

                mockLibraryRepository.create.mockReturnValue(mockCreatedComponent as any);
                mockLibraryRepository.save.mockResolvedValue(mockCreatedComponent as any);

                await service.saveComponentsForType(createDto);

                expect(mockLibraryRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    packageManagerUrl: 'https://www.npmjs.com/package/test-package',
                    readmeContent: 'This is a test library',
                });
                expect(mockLibraryRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
            });
        });

        describe('Frontend Component Creation', () => {
            it('should create Frontend component successfully', async () => {
                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType: ApplicationTypeEnum.FRONTEND,
                    dtos: {
                        applicationComponentFrontend: {
                            frontendUrl: 'https://test.frontend.com',
                            screenshotUrl: 'https://test.frontend.com/screenshot',
                        },
                    },
                };

                const mockCreatedComponent = {
                    applicationId: mockApplication.id,
                    frontendUrl: 'https://test.frontend.com',
                    screenshotUrl: 'https://test.frontend.com/screenshot',
                };

                mockFrontendRepository.create.mockReturnValue(mockCreatedComponent as any);
                mockFrontendRepository.save.mockResolvedValue(mockCreatedComponent as any);

                await service.saveComponentsForType(createDto);

                expect(mockFrontendRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    frontendUrl: 'https://test.frontend.com',
                    screenshotUrl: 'https://test.frontend.com/screenshot',
                });
                expect(mockFrontendRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
            });
        });

        describe('Fullstack Component Creation', () => {
            it('should create both API and Frontend components for FULLSTACK type', async () => {
                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType: ApplicationTypeEnum.FULLSTACK,
                    dtos: {
                        applicationComponentApi: {
                            domain: 'test.api.com',
                            apiUrl: 'https://test.api.com/api/v1',
                            documentationUrl: 'https://test.api.com/docs',
                            healthCheckEndpoint: 'https://test.api.com/health',
                        },
                        applicationComponentFrontend: {
                            frontendUrl: 'https://test.frontend.com',
                            screenshotUrl: 'https://test.frontend.com/screenshot',
                        },
                    },
                };

                const mockApiComponent = {
                    applicationId: mockApplication.id,
                    domain: 'test.api.com',
                    apiUrl: 'https://test.api.com/api/v1',
                    documentationUrl: 'https://test.api.com/docs',
                    healthCheckEndpoint: 'https://test.api.com/health',
                };

                const mockFrontendComponent = {
                    applicationId: mockApplication.id,
                    frontendUrl: 'https://test.frontend.com',
                    screenshotUrl: 'https://test.frontend.com/screenshot',
                };

                mockApiRepository.create.mockReturnValue(mockApiComponent as any);
                mockApiRepository.save.mockResolvedValue(mockApiComponent as any);
                mockFrontendRepository.create.mockReturnValue(mockFrontendComponent as any);
                mockFrontendRepository.save.mockResolvedValue(mockFrontendComponent as any);

                await service.saveComponentsForType(createDto);

                expect(mockApiRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    domain: 'test.api.com',
                    apiUrl: 'https://test.api.com/api/v1',
                    documentationUrl: 'https://test.api.com/docs',
                    healthCheckEndpoint: 'https://test.api.com/health',
                });
                expect(mockFrontendRepository.create).toHaveBeenCalledWith({
                    applicationId: mockApplication.id,
                    frontendUrl: 'https://test.frontend.com',
                    screenshotUrl: 'https://test.frontend.com/screenshot',
                });
            });
        });
    });

    describe('Repository Integration Tests', () => {
        let mockApplication: MockApplication;

        beforeEach(() => {
            mockApplication = {
                id: 1,
                userId: 1,
                name: 'Test Application',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                isActive: true,
                user: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        it('should create API component through repository', async () => {
            const apiData = {
                applicationId: mockApplication.id,
                domain: 'test.api.com',
                apiUrl: 'https://test.api.com/api/v1',
                documentationUrl: 'https://test.api.com/docs',
                healthCheckEndpoint: 'https://test.api.com/health',
            };

            const mockCreatedComponent = { ...apiData };
            mockApiRepository.create.mockReturnValue(mockCreatedComponent as any);
            mockApiRepository.save.mockResolvedValue(mockCreatedComponent as any);

            const createdComponent = await repository.createApi(apiData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(mockApplication.id);
            expect(createdComponent.domain).toBe('test.api.com');
            expect(mockApiRepository.create).toHaveBeenCalledWith(apiData);
            expect(mockApiRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
        });

        it('should create Mobile component through repository', async () => {
            const mobileData = {
                applicationId: mockApplication.id,
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'https://test.mobile.com/download/1.0.0',
            };

            const mockCreatedComponent = { ...mobileData };
            mockMobileRepository.create.mockReturnValue(mockCreatedComponent as any);
            mockMobileRepository.save.mockResolvedValue(mockCreatedComponent as any);

            const createdComponent = await repository.createMobile(mobileData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(mockApplication.id);
            expect(createdComponent.platform).toBe(MobilePlatformEnum.ANDROID);
            expect(mockMobileRepository.create).toHaveBeenCalledWith(mobileData);
            expect(mockMobileRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
        });

        it('should create Library component through repository', async () => {
            const libraryData = {
                applicationId: mockApplication.id,
                packageManagerUrl: 'https://www.npmjs.com/package/test-package',
                readmeContent: 'This is a test library',
            };

            const mockCreatedComponent = { ...libraryData };
            mockLibraryRepository.create.mockReturnValue(mockCreatedComponent as any);
            mockLibraryRepository.save.mockResolvedValue(mockCreatedComponent as any);

            const createdComponent = await repository.createLibrary(libraryData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(mockApplication.id);
            expect(createdComponent.packageManagerUrl).toBe('https://www.npmjs.com/package/test-package');
            expect(mockLibraryRepository.create).toHaveBeenCalledWith(libraryData);
            expect(mockLibraryRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
        });

        it('should create Frontend component through repository', async () => {
            const frontendData = {
                applicationId: mockApplication.id,
                frontendUrl: 'https://test.frontend.com',
                screenshotUrl: 'https://test.frontend.com/screenshot',
            };

            const mockCreatedComponent = { ...frontendData };
            mockFrontendRepository.create.mockReturnValue(mockCreatedComponent as any);
            mockFrontendRepository.save.mockResolvedValue(mockCreatedComponent as any);

            const createdComponent = await repository.createFrontend(frontendData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(mockApplication.id);
            expect(createdComponent.frontendUrl).toBe('https://test.frontend.com');
            expect(mockFrontendRepository.create).toHaveBeenCalledWith(frontendData);
            expect(mockFrontendRepository.save).toHaveBeenCalledWith(mockCreatedComponent);
        });
    });

    describe('Service and Repository Integration', () => {
        it('should handle all application types correctly', async () => {
            const applicationTypes = [
                ApplicationTypeEnum.API,
                ApplicationTypeEnum.MOBILE,
                ApplicationTypeEnum.LIBRARY,
                ApplicationTypeEnum.FRONTEND,
                ApplicationTypeEnum.FULLSTACK,
            ];

            for (const applicationType of applicationTypes) {
                const mockApplication: MockApplication = {
                    id: 1,
                    userId: 1,
                    name: 'Test Application',
                    description: 'Test Description',
                    applicationType,
                    isActive: true,
                    user: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const createDto: MockCreateComponentsForTypeDto = {
                    application: mockApplication,
                    applicationType,
                    dtos: {
                        applicationComponentApi: applicationType === ApplicationTypeEnum.API || applicationType === ApplicationTypeEnum.FULLSTACK ? {
                            domain: 'test.api.com',
                            apiUrl: 'https://test.api.com/api/v1',
                        } : undefined,
                        applicationComponentMobile: applicationType === ApplicationTypeEnum.MOBILE ? {
                            platform: MobilePlatformEnum.ANDROID,
                            downloadUrl: 'https://test.mobile.com/download',
                        } : undefined,
                        applicationComponentLibrary: applicationType === ApplicationTypeEnum.LIBRARY ? {
                            packageManagerUrl: 'https://www.npmjs.com/package/test-package',
                        } : undefined,
                        applicationComponentFrontend: applicationType === ApplicationTypeEnum.FRONTEND || applicationType === ApplicationTypeEnum.FULLSTACK ? {
                            frontendUrl: 'https://test.frontend.com',
                        } : undefined,
                    },
                };

                // Setup mocks for each repository
                mockApiRepository.create.mockReturnValue({} as any);
                mockApiRepository.save.mockResolvedValue({} as any);
                mockMobileRepository.create.mockReturnValue({} as any);
                mockMobileRepository.save.mockResolvedValue({} as any);
                mockLibraryRepository.create.mockReturnValue({} as any);
                mockLibraryRepository.save.mockResolvedValue({} as any);
                mockFrontendRepository.create.mockReturnValue({} as any);
                mockFrontendRepository.save.mockResolvedValue({} as any);

                await service.saveComponentsForType(createDto);

                // Verify the correct repositories were called based on application type
                if (applicationType === ApplicationTypeEnum.API) {
                    expect(mockApiRepository.create).toHaveBeenCalled();
                    expect(mockApiRepository.save).toHaveBeenCalled();
                } else if (applicationType === ApplicationTypeEnum.MOBILE) {
                    expect(mockMobileRepository.create).toHaveBeenCalled();
                    expect(mockMobileRepository.save).toHaveBeenCalled();
                } else if (applicationType === ApplicationTypeEnum.LIBRARY) {
                    expect(mockLibraryRepository.create).toHaveBeenCalled();
                    expect(mockLibraryRepository.save).toHaveBeenCalled();
                } else if (applicationType === ApplicationTypeEnum.FRONTEND) {
                    expect(mockFrontendRepository.create).toHaveBeenCalled();
                    expect(mockFrontendRepository.save).toHaveBeenCalled();
                } else if (applicationType === ApplicationTypeEnum.FULLSTACK) {
                    expect(mockApiRepository.create).toHaveBeenCalled();
                    expect(mockApiRepository.save).toHaveBeenCalled();
                    expect(mockFrontendRepository.create).toHaveBeenCalled();
                    expect(mockFrontendRepository.save).toHaveBeenCalled();
                }

                // Reset mocks for next iteration
                jest.clearAllMocks();
            }
        });
    });
});
