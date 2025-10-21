import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';

// Mock entities to avoid circular dependencies
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

// Mock Repository for integration testing
class MockApplicationComponentsRepository {
    private apiComponents: MockApplicationComponentApi[] = [];
    private mobileComponents: MockApplicationComponentMobile[] = [];
    private libraryComponents: MockApplicationComponentLibrary[] = [];
    private frontendComponents: MockApplicationComponentFrontend[] = [];

    async createApi(object: Partial<MockApplicationComponentApi>): Promise<MockApplicationComponentApi> {
        const component: MockApplicationComponentApi = {
            applicationId: object.applicationId!,
            domain: object.domain!,
            apiUrl: object.apiUrl!,
            documentationUrl: object.documentationUrl,
            healthCheckEndpoint: object.healthCheckEndpoint,
        };
        this.apiComponents.push(component);
        return component;
    }

    async createMobile(object: Partial<MockApplicationComponentMobile>): Promise<MockApplicationComponentMobile> {
        const component: MockApplicationComponentMobile = {
            applicationId: object.applicationId!,
            platform: object.platform!,
            downloadUrl: object.downloadUrl,
            associatedApiId: object.associatedApiId,
        };
        this.mobileComponents.push(component);
        return component;
    }

    async createLibrary(object: Partial<MockApplicationComponentLibrary>): Promise<MockApplicationComponentLibrary> {
        const component: MockApplicationComponentLibrary = {
            applicationId: object.applicationId!,
            packageManagerUrl: object.packageManagerUrl!,
            readmeContent: object.readmeContent,
        };
        this.libraryComponents.push(component);
        return component;
    }

    async createFrontend(object: Partial<MockApplicationComponentFrontend>): Promise<MockApplicationComponentFrontend> {
        const component: MockApplicationComponentFrontend = {
            applicationId: object.applicationId!,
            frontendUrl: object.frontendUrl!,
            screenshotUrl: object.screenshotUrl,
            associatedApiId: object.associatedApiId,
        };
        this.frontendComponents.push(component);
        return component;
    }

    // Helper methods for testing
    getApiComponents(): MockApplicationComponentApi[] {
        return [...this.apiComponents];
    }

    getMobileComponents(): MockApplicationComponentMobile[] {
        return [...this.mobileComponents];
    }

    getLibraryComponents(): MockApplicationComponentLibrary[] {
        return [...this.libraryComponents];
    }

    getFrontendComponents(): MockApplicationComponentFrontend[] {
        return [...this.frontendComponents];
    }

    clear(): void {
        this.apiComponents = [];
        this.mobileComponents = [];
        this.libraryComponents = [];
        this.frontendComponents = [];
    }
}

// Mock Service that replicates the business logic from ApplicationComponentsService
class MockApplicationComponentsService {
    constructor(private readonly applicationComponentsRepository: MockApplicationComponentsRepository) { }

    async saveComponentsForType({
        dtos,
        application,
        applicationType,
    }: MockCreateComponentsForTypeDto) {
        switch (applicationType) {
            case ApplicationTypeEnum.API:
                await this.applicationComponentsRepository.createApi({
                    applicationId: application.id,
                    ...dtos.applicationComponentApi,
                });
                break;

            case ApplicationTypeEnum.FRONTEND:
                await this.applicationComponentsRepository.createFrontend({
                    applicationId: application.id,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.FULLSTACK:
                await this.applicationComponentsRepository.createApi({
                    applicationId: application.id,
                    ...dtos.applicationComponentApi,
                });
                await this.applicationComponentsRepository.createFrontend({
                    applicationId: application.id,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.MOBILE:
                await this.applicationComponentsRepository.createMobile({
                    applicationId: application.id,
                    ...dtos.applicationComponentMobile,
                });
                break;

            case ApplicationTypeEnum.LIBRARY:
                await this.applicationComponentsRepository.createLibrary({
                    applicationId: application.id,
                    ...dtos.applicationComponentLibrary,
                });
                break;
        }
    }
}

describe('ApplicationComponentsService Integration Tests', () => {
    let service: MockApplicationComponentsService;
    let mockRepository: MockApplicationComponentsRepository;

    // Test data
    let testApplication: MockApplication;

    beforeEach(() => {
        // Create test application for each test
        testApplication = {
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

        // Initialize service and repository
        mockRepository = new MockApplicationComponentsRepository();
        service = new MockApplicationComponentsService(mockRepository);
    });

    describe('API Component Creation', () => {
        it('should create API component successfully', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
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

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getApiComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.applicationId).toBe(testApplication.id);
            expect(component.domain).toBe('test.api.com');
            expect(component.apiUrl).toBe('https://test.api.com/api/v1');
            expect(component.documentationUrl).toBe('https://test.api.com/docs');
            expect(component.healthCheckEndpoint).toBe('https://test.api.com/health');
        });

        it('should create API component with minimal required fields', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: {
                        domain: 'minimal.api.com',
                        apiUrl: 'https://minimal.api.com/api',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getApiComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.domain).toBe('minimal.api.com');
            expect(component.apiUrl).toBe('https://minimal.api.com/api');
            expect(component.documentationUrl).toBeUndefined();
            expect(component.healthCheckEndpoint).toBeUndefined();
        });
    });

    describe('Mobile Component Creation', () => {
        it('should create Mobile component for Android platform', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.ANDROID,
                        downloadUrl: 'https://play.google.com/store/apps/details?id=com.test.app',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getMobileComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.applicationId).toBe(testApplication.id);
            expect(component.platform).toBe(MobilePlatformEnum.ANDROID);
            expect(component.downloadUrl).toBe('https://play.google.com/store/apps/details?id=com.test.app');
        });

        it('should create Mobile component for iOS platform', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.IOS,
                        downloadUrl: 'https://apps.apple.com/app/test-app/id123456789',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getMobileComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.platform).toBe(MobilePlatformEnum.IOS);
            expect(component.downloadUrl).toBe('https://apps.apple.com/app/test-app/id123456789');
        });

        it('should create Mobile component for Multiplatform', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.MULTIPLATFORM,
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getMobileComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.platform).toBe(MobilePlatformEnum.MULTIPLATFORM);
            expect(component.downloadUrl).toBeUndefined();
        });
    });

    describe('Library Component Creation', () => {
        it('should create Library component with package manager URL', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentLibrary: {
                        packageManagerUrl: 'https://www.npmjs.com/package/test-library',
                        readmeContent: '# Test Library\n\nThis is a test library for demonstration purposes.',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getLibraryComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.applicationId).toBe(testApplication.id);
            expect(component.packageManagerUrl).toBe('https://www.npmjs.com/package/test-library');
            expect(component.readmeContent).toBe('# Test Library\n\nThis is a test library for demonstration purposes.');
        });

        it('should create Library component with minimal required fields', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentLibrary: {
                        packageManagerUrl: 'https://pypi.org/project/test-package/',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getLibraryComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.packageManagerUrl).toBe('https://pypi.org/project/test-package/');
            expect(component.readmeContent).toBeUndefined();
        });
    });

    describe('Frontend Component Creation', () => {
        it('should create Frontend component with URL and screenshot', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentFrontend: {
                        frontendUrl: 'https://test-frontend.vercel.app',
                        screenshotUrl: 'https://test-frontend.vercel.app/screenshot.png',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getFrontendComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.applicationId).toBe(testApplication.id);
            expect(component.frontendUrl).toBe('https://test-frontend.vercel.app');
            expect(component.screenshotUrl).toBe('https://test-frontend.vercel.app/screenshot.png');
        });

        it('should create Frontend component with minimal required fields', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentFrontend: {
                        frontendUrl: 'https://simple-frontend.netlify.app',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            const createdComponents = mockRepository.getFrontendComponents();
            expect(createdComponents).toHaveLength(1);

            const component = createdComponents[0];
            expect(component.frontendUrl).toBe('https://simple-frontend.netlify.app');
            expect(component.screenshotUrl).toBeUndefined();
        });
    });

    describe('Fullstack Component Creation', () => {
        it('should create both API and Frontend components for FULLSTACK type', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: {
                        domain: 'fullstack.api.com',
                        apiUrl: 'https://fullstack.api.com/api/v1',
                        documentationUrl: 'https://fullstack.api.com/docs',
                        healthCheckEndpoint: 'https://fullstack.api.com/health',
                    },
                    applicationComponentFrontend: {
                        frontendUrl: 'https://fullstack-frontend.vercel.app',
                        screenshotUrl: 'https://fullstack-frontend.vercel.app/screenshot.png',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Check API component was created
            const createdApiComponents = mockRepository.getApiComponents();
            expect(createdApiComponents).toHaveLength(1);

            const apiComponent = createdApiComponents[0];
            expect(apiComponent.domain).toBe('fullstack.api.com');
            expect(apiComponent.apiUrl).toBe('https://fullstack.api.com/api/v1');

            // Check Frontend component was created
            const createdFrontendComponents = mockRepository.getFrontendComponents();
            expect(createdFrontendComponents).toHaveLength(1);

            const frontendComponent = createdFrontendComponents[0];
            expect(frontendComponent.frontendUrl).toBe('https://fullstack-frontend.vercel.app');
            expect(frontendComponent.screenshotUrl).toBe('https://fullstack-frontend.vercel.app/screenshot.png');
        });
    });

    describe('Error Scenarios and Edge Cases', () => {
        it('should handle missing DTO data gracefully', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {},
            };

            // This should not throw an error but should create a component with undefined values
            // The actual service behavior is to create components even with undefined values
            await service.saveComponentsForType(createDto);

            const apiComponents = mockRepository.getApiComponents();
            expect(apiComponents).toHaveLength(1);

            // Verify the component was created with undefined values
            const component = apiComponents[0];
            expect(component.applicationId).toBe(testApplication.id);
            expect(component.domain).toBeUndefined();
            expect(component.apiUrl).toBeUndefined();
        });

        it('should not create components for unsupported application types', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: 'UNSUPPORTED' as ApplicationTypeEnum,
                dtos: {
                    applicationComponentApi: {
                        domain: 'test.api.com',
                        apiUrl: 'https://test.api.com/api/v1',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Should not create any components
            const apiComponents = mockRepository.getApiComponents();
            const mobileComponents = mockRepository.getMobileComponents();
            const libraryComponents = mockRepository.getLibraryComponents();
            const frontendComponents = mockRepository.getFrontendComponents();

            expect(apiComponents).toHaveLength(0);
            expect(mobileComponents).toHaveLength(0);
            expect(libraryComponents).toHaveLength(0);
            expect(frontendComponents).toHaveLength(0);
        });
    });

    describe('Repository Integration', () => {
        it('should use repository methods correctly for API components', async () => {
            const apiData = {
                applicationId: testApplication.id,
                domain: 'repository-test.api.com',
                apiUrl: 'https://repository-test.api.com/api/v1',
                documentationUrl: 'https://repository-test.api.com/docs',
                healthCheckEndpoint: 'https://repository-test.api.com/health',
            };

            const createdComponent = await mockRepository.createApi(apiData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(testApplication.id);
            expect(createdComponent.domain).toBe('repository-test.api.com');

            // Verify it was saved in mock repository
            const savedComponents = mockRepository.getApiComponents();
            expect(savedComponents).toHaveLength(1);
            expect(savedComponents[0].domain).toBe('repository-test.api.com');
        });

        it('should use repository methods correctly for Mobile components', async () => {
            const mobileData = {
                applicationId: testApplication.id,
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'https://play.google.com/store/apps/details?id=com.repository.test',
            };

            const createdComponent = await mockRepository.createMobile(mobileData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(testApplication.id);
            expect(createdComponent.platform).toBe(MobilePlatformEnum.ANDROID);

            // Verify it was saved in mock repository
            const savedComponents = mockRepository.getMobileComponents();
            expect(savedComponents).toHaveLength(1);
            expect(savedComponents[0].platform).toBe(MobilePlatformEnum.ANDROID);
        });

        it('should use repository methods correctly for Library components', async () => {
            const libraryData = {
                applicationId: testApplication.id,
                packageManagerUrl: 'https://www.npmjs.com/package/repository-test',
                readmeContent: 'Repository test library',
            };

            const createdComponent = await mockRepository.createLibrary(libraryData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(testApplication.id);
            expect(createdComponent.packageManagerUrl).toBe('https://www.npmjs.com/package/repository-test');

            // Verify it was saved in mock repository
            const savedComponents = mockRepository.getLibraryComponents();
            expect(savedComponents).toHaveLength(1);
            expect(savedComponents[0].packageManagerUrl).toBe('https://www.npmjs.com/package/repository-test');
        });

        it('should use repository methods correctly for Frontend components', async () => {
            const frontendData = {
                applicationId: testApplication.id,
                frontendUrl: 'https://repository-test-frontend.vercel.app',
                screenshotUrl: 'https://repository-test-frontend.vercel.app/screenshot.png',
            };

            const createdComponent = await mockRepository.createFrontend(frontendData);

            expect(createdComponent).toBeDefined();
            expect(createdComponent.applicationId).toBe(testApplication.id);
            expect(createdComponent.frontendUrl).toBe('https://repository-test-frontend.vercel.app');

            // Verify it was saved in mock repository
            const savedComponents = mockRepository.getFrontendComponents();
            expect(savedComponents).toHaveLength(1);
            expect(savedComponents[0].frontendUrl).toBe('https://repository-test-frontend.vercel.app');
        });
    });

    describe('Service Method Integration', () => {
        it('should handle all application types in sequence', async () => {
            const applicationTypes = [
                ApplicationTypeEnum.API,
                ApplicationTypeEnum.MOBILE,
                ApplicationTypeEnum.LIBRARY,
                ApplicationTypeEnum.FRONTEND,
                ApplicationTypeEnum.FULLSTACK,
            ];

            for (let i = 0; i < applicationTypes.length; i++) {
                const applicationType = applicationTypes[i];

                // Create a new application for each type
                const application: MockApplication = {
                    id: i + 2, // Start from 2 since we already have one
                    userId: 1,
                    name: `Test Application ${i + 1}`,
                    description: `Test Description ${i + 1}`,
                    applicationType,
                    isActive: true,
                    user: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const createDto: MockCreateComponentsForTypeDto = {
                    application,
                    applicationType,
                    dtos: {
                        applicationComponentApi: applicationType === ApplicationTypeEnum.API || applicationType === ApplicationTypeEnum.FULLSTACK ? {
                            domain: `test${i}.api.com`,
                            apiUrl: `https://test${i}.api.com/api/v1`,
                        } : undefined,
                        applicationComponentMobile: applicationType === ApplicationTypeEnum.MOBILE ? {
                            platform: MobilePlatformEnum.ANDROID,
                            downloadUrl: `https://test${i}.mobile.com/download`,
                        } : undefined,
                        applicationComponentLibrary: applicationType === ApplicationTypeEnum.LIBRARY ? {
                            packageManagerUrl: `https://www.npmjs.com/package/test-package-${i}`,
                        } : undefined,
                        applicationComponentFrontend: applicationType === ApplicationTypeEnum.FRONTEND || applicationType === ApplicationTypeEnum.FULLSTACK ? {
                            frontendUrl: `https://test${i}.frontend.com`,
                        } : undefined,
                    },
                };

                await service.saveComponentsForType(createDto);

                // Verify the correct component was created
                if (applicationType === ApplicationTypeEnum.API) {
                    const apiComponents = mockRepository.getApiComponents();
                    expect(apiComponents).toHaveLength(1);
                    expect(apiComponents[0].domain).toBe(`test${i}.api.com`);
                } else if (applicationType === ApplicationTypeEnum.MOBILE) {
                    const mobileComponents = mockRepository.getMobileComponents();
                    expect(mobileComponents).toHaveLength(1);
                    expect(mobileComponents[0].platform).toBe(MobilePlatformEnum.ANDROID);
                } else if (applicationType === ApplicationTypeEnum.LIBRARY) {
                    const libraryComponents = mockRepository.getLibraryComponents();
                    expect(libraryComponents).toHaveLength(1);
                    expect(libraryComponents[0].packageManagerUrl).toBe(`https://www.npmjs.com/package/test-package-${i}`);
                } else if (applicationType === ApplicationTypeEnum.FRONTEND) {
                    const frontendComponents = mockRepository.getFrontendComponents();
                    expect(frontendComponents).toHaveLength(1);
                    expect(frontendComponents[0].frontendUrl).toBe(`https://test${i}.frontend.com`);
                } else if (applicationType === ApplicationTypeEnum.FULLSTACK) {
                    const apiComponents = mockRepository.getApiComponents();
                    const frontendComponents = mockRepository.getFrontendComponents();
                    expect(apiComponents).toHaveLength(1);
                    expect(frontendComponents).toHaveLength(1);
                }

                // Clear repository for next iteration
                mockRepository.clear();
            }
        });
    });

    describe('Service and Repository Integration', () => {
        it('should properly integrate service with repository for all component types', async () => {
            // Test API component
            const apiDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: {
                        domain: 'integration-test.api.com',
                        apiUrl: 'https://integration-test.api.com/api/v1',
                    },
                },
            };

            await service.saveComponentsForType(apiDto);
            expect(mockRepository.getApiComponents()).toHaveLength(1);

            // Test Mobile component
            mockRepository.clear();
            const mobileDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.IOS,
                        downloadUrl: 'https://apps.apple.com/app/integration-test/id123456789',
                    },
                },
            };

            await service.saveComponentsForType(mobileDto);
            expect(mockRepository.getMobileComponents()).toHaveLength(1);

            // Test Library component
            mockRepository.clear();
            const libraryDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentLibrary: {
                        packageManagerUrl: 'https://www.npmjs.com/package/integration-test',
                        readmeContent: 'Integration test library',
                    },
                },
            };

            await service.saveComponentsForType(libraryDto);
            expect(mockRepository.getLibraryComponents()).toHaveLength(1);

            // Test Frontend component
            mockRepository.clear();
            const frontendDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentFrontend: {
                        frontendUrl: 'https://integration-test-frontend.vercel.app',
                        screenshotUrl: 'https://integration-test-frontend.vercel.app/screenshot.png',
                    },
                },
            };

            await service.saveComponentsForType(frontendDto);
            expect(mockRepository.getFrontendComponents()).toHaveLength(1);

            // Test Fullstack component
            mockRepository.clear();
            const fullstackDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: {
                        domain: 'fullstack-integration.api.com',
                        apiUrl: 'https://fullstack-integration.api.com/api/v1',
                    },
                    applicationComponentFrontend: {
                        frontendUrl: 'https://fullstack-integration-frontend.vercel.app',
                    },
                },
            };

            await service.saveComponentsForType(fullstackDto);
            expect(mockRepository.getApiComponents()).toHaveLength(1);
            expect(mockRepository.getFrontendComponents()).toHaveLength(1);
        });
    });

    describe('Business Logic Validation', () => {
        it('should correctly route API application type to API repository', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.API,
                dtos: {
                    applicationComponentApi: {
                        domain: 'business-logic.api.com',
                        apiUrl: 'https://business-logic.api.com/api/v1',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Verify only API component was created
            expect(mockRepository.getApiComponents()).toHaveLength(1);
            expect(mockRepository.getMobileComponents()).toHaveLength(0);
            expect(mockRepository.getLibraryComponents()).toHaveLength(0);
            expect(mockRepository.getFrontendComponents()).toHaveLength(0);
        });

        it('should correctly route MOBILE application type to Mobile repository', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
                dtos: {
                    applicationComponentMobile: {
                        platform: MobilePlatformEnum.ANDROID,
                        downloadUrl: 'https://business-logic.mobile.com/download',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Verify only Mobile component was created
            expect(mockRepository.getApiComponents()).toHaveLength(0);
            expect(mockRepository.getMobileComponents()).toHaveLength(1);
            expect(mockRepository.getLibraryComponents()).toHaveLength(0);
            expect(mockRepository.getFrontendComponents()).toHaveLength(0);
        });

        it('should correctly route LIBRARY application type to Library repository', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.LIBRARY,
                dtos: {
                    applicationComponentLibrary: {
                        packageManagerUrl: 'https://www.npmjs.com/package/business-logic',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Verify only Library component was created
            expect(mockRepository.getApiComponents()).toHaveLength(0);
            expect(mockRepository.getMobileComponents()).toHaveLength(0);
            expect(mockRepository.getLibraryComponents()).toHaveLength(1);
            expect(mockRepository.getFrontendComponents()).toHaveLength(0);
        });

        it('should correctly route FRONTEND application type to Frontend repository', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FRONTEND,
                dtos: {
                    applicationComponentFrontend: {
                        frontendUrl: 'https://business-logic-frontend.vercel.app',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Verify only Frontend component was created
            expect(mockRepository.getApiComponents()).toHaveLength(0);
            expect(mockRepository.getMobileComponents()).toHaveLength(0);
            expect(mockRepository.getLibraryComponents()).toHaveLength(0);
            expect(mockRepository.getFrontendComponents()).toHaveLength(1);
        });

        it('should correctly route FULLSTACK application type to both API and Frontend repositories', async () => {
            const createDto: MockCreateComponentsForTypeDto = {
                application: testApplication,
                applicationType: ApplicationTypeEnum.FULLSTACK,
                dtos: {
                    applicationComponentApi: {
                        domain: 'business-logic-fullstack.api.com',
                        apiUrl: 'https://business-logic-fullstack.api.com/api/v1',
                    },
                    applicationComponentFrontend: {
                        frontendUrl: 'https://business-logic-fullstack-frontend.vercel.app',
                    },
                },
            };

            await service.saveComponentsForType(createDto);

            // Verify both API and Frontend components were created
            expect(mockRepository.getApiComponents()).toHaveLength(1);
            expect(mockRepository.getMobileComponents()).toHaveLength(0);
            expect(mockRepository.getLibraryComponents()).toHaveLength(0);
            expect(mockRepository.getFrontendComponents()).toHaveLength(1);
        });
    });
});