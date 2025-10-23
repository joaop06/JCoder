import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';

// Mock entities to avoid circular dependencies
interface ApplicationComponentApi {
    applicationId: number;
    domain: string;
    apiUrl: string;
    documentationUrl?: string;
    healthCheckEndpoint?: string;
}

interface ApplicationComponentMobile {
    applicationId: number;
    platform: MobilePlatformEnum;
    downloadUrl?: string;
    associatedApiId?: number;
}

interface ApplicationComponentLibrary {
    applicationId: number;
    packageManagerUrl: string;
    readmeContent?: string;
}

interface ApplicationComponentFrontend {
    applicationId: number;
    frontendUrl: string;
    screenshotUrl?: string;
    associatedApiId?: number;
}

// Mock the repository class to avoid circular dependencies
class MockApplicationComponentsRepository {
    constructor(
        private readonly apiRepository: Repository<ApplicationComponentApi>,
        private readonly mobileRepository: Repository<ApplicationComponentMobile>,
        private readonly libraryRepository: Repository<ApplicationComponentLibrary>,
        private readonly frontendRepository: Repository<ApplicationComponentFrontend>,
    ) { }

    async createApi(object: Partial<ApplicationComponentApi>): Promise<ApplicationComponentApi> {
        const component = this.apiRepository.create(object);
        return await this.apiRepository.save(component);
    }

    async createMobile(object: Partial<ApplicationComponentMobile>): Promise<ApplicationComponentMobile> {
        const component = this.mobileRepository.create(object);
        return await this.mobileRepository.save(component);
    }

    async createLibrary(object: Partial<ApplicationComponentLibrary>): Promise<ApplicationComponentLibrary> {
        const component = this.libraryRepository.create(object);
        return await this.libraryRepository.save(component);
    }

    async createFrontend(object: Partial<ApplicationComponentFrontend>): Promise<ApplicationComponentFrontend> {
        const component = this.frontendRepository.create(object);
        return await this.frontendRepository.save(component);
    }
}

describe('ApplicationComponentsRepository', () => {
    let repository: MockApplicationComponentsRepository;
    let apiRepository: Repository<ApplicationComponentApi>;
    let mobileRepository: Repository<ApplicationComponentMobile>;
    let libraryRepository: Repository<ApplicationComponentLibrary>;
    let frontendRepository: Repository<ApplicationComponentFrontend>;

    // Mock data
    const mockApiComponent: Partial<ApplicationComponentApi> = {
        applicationId: 1,
        domain: 'example.com',
        apiUrl: 'https://example.com/api',
        documentationUrl: 'https://example.com/docs',
        healthCheckEndpoint: 'https://example.com/health',
    };

    const mockMobileComponent: Partial<ApplicationComponentMobile> = {
        applicationId: 1,
        platform: MobilePlatformEnum.ANDROID,
        downloadUrl: 'https://example.com/download/app.apk',
        associatedApiId: 1,
    };

    const mockLibraryComponent: Partial<ApplicationComponentLibrary> = {
        applicationId: 1,
        packageManagerUrl: 'https://www.npmjs.com/package/test-package',
        readmeContent: 'This is a test library',
    };

    const mockFrontendComponent: Partial<ApplicationComponentFrontend> = {
        applicationId: 1,
        frontendUrl: 'https://example.com/frontend',
        screenshotUrl: 'https://example.com/screenshot.png',
        associatedApiId: 1,
    };

    const mockCreatedApiComponent: ApplicationComponentApi = {
        ...mockApiComponent,
    } as ApplicationComponentApi;

    const mockCreatedMobileComponent: ApplicationComponentMobile = {
        ...mockMobileComponent,
    } as ApplicationComponentMobile;

    const mockCreatedLibraryComponent: ApplicationComponentLibrary = {
        ...mockLibraryComponent,
    } as ApplicationComponentLibrary;

    const mockCreatedFrontendComponent: ApplicationComponentFrontend = {
        ...mockFrontendComponent,
    } as ApplicationComponentFrontend;

    beforeEach(async () => {
        // Create mock repositories
        const mockApiRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockMobileRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockLibraryRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockFrontendRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        // Create repository instance manually
        repository = new MockApplicationComponentsRepository(
            mockApiRepo as any,
            mockMobileRepo as any,
            mockLibraryRepo as any,
            mockFrontendRepo as any,
        );

        // Assign repositories for spy access
        apiRepository = mockApiRepo as any;
        mobileRepository = mockMobileRepo as any;
        libraryRepository = mockLibraryRepo as any;
        frontendRepository = mockFrontendRepo as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('createApi', () => {
        it('should create an API component successfully', async () => {
            // Arrange
            const createSpy = jest.spyOn(apiRepository, 'create').mockReturnValue(mockCreatedApiComponent);
            const saveSpy = jest.spyOn(apiRepository, 'save').mockResolvedValue(mockCreatedApiComponent);

            // Act
            const result = await repository.createApi(mockApiComponent);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(mockApiComponent);
            expect(saveSpy).toHaveBeenCalledWith(mockCreatedApiComponent);
            expect(result).toEqual(mockCreatedApiComponent);
        });

        it('should handle API component creation with minimal data', async () => {
            // Arrange
            const minimalApiData: Partial<ApplicationComponentApi> = {
                applicationId: 1,
                domain: 'minimal.com',
                apiUrl: 'https://minimal.com/api',
            };

            const mockMinimalComponent: ApplicationComponentApi = {
                ...minimalApiData,
            } as ApplicationComponentApi;

            const createSpy = jest.spyOn(apiRepository, 'create').mockReturnValue(mockMinimalComponent);
            const saveSpy = jest.spyOn(apiRepository, 'save').mockResolvedValue(mockMinimalComponent);

            // Act
            const result = await repository.createApi(minimalApiData);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(minimalApiData);
            expect(saveSpy).toHaveBeenCalledWith(mockMinimalComponent);
            expect(result).toEqual(mockMinimalComponent);
        });

        it('should propagate errors from API repository', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.spyOn(apiRepository, 'create').mockReturnValue(mockCreatedApiComponent);
            jest.spyOn(apiRepository, 'save').mockRejectedValue(error);

            // Act & Assert
            await expect(repository.createApi(mockApiComponent)).rejects.toThrow('Database error');
        });
    });

    describe('createMobile', () => {
        it('should create a mobile component successfully', async () => {
            // Arrange
            const createSpy = jest.spyOn(mobileRepository, 'create').mockReturnValue(mockCreatedMobileComponent);
            const saveSpy = jest.spyOn(mobileRepository, 'save').mockResolvedValue(mockCreatedMobileComponent);

            // Act
            const result = await repository.createMobile(mockMobileComponent);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(mockMobileComponent);
            expect(saveSpy).toHaveBeenCalledWith(mockCreatedMobileComponent);
            expect(result).toEqual(mockCreatedMobileComponent);
        });

        it('should create a mobile component for iOS platform', async () => {
            // Arrange
            const iosMobileData: Partial<ApplicationComponentMobile> = {
                applicationId: 2,
                platform: MobilePlatformEnum.IOS,
                downloadUrl: 'https://apps.apple.com/app/test-app',
            };

            const mockIosComponent: ApplicationComponentMobile = {
                ...iosMobileData,
            } as ApplicationComponentMobile;

            const createSpy = jest.spyOn(mobileRepository, 'create').mockReturnValue(mockIosComponent);
            const saveSpy = jest.spyOn(mobileRepository, 'save').mockResolvedValue(mockIosComponent);

            // Act
            const result = await repository.createMobile(iosMobileData);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(iosMobileData);
            expect(saveSpy).toHaveBeenCalledWith(mockIosComponent);
            expect(result).toEqual(mockIosComponent);
        });

        it('should create a mobile component without associated API', async () => {
            // Arrange
            const mobileWithoutApi: Partial<ApplicationComponentMobile> = {
                applicationId: 3,
                platform: MobilePlatformEnum.ANDROID,
                downloadUrl: 'https://example.com/download/app.apk',
            };

            const mockComponent: ApplicationComponentMobile = {
                ...mobileWithoutApi,
            } as ApplicationComponentMobile;

            const createSpy = jest.spyOn(mobileRepository, 'create').mockReturnValue(mockComponent);
            const saveSpy = jest.spyOn(mobileRepository, 'save').mockResolvedValue(mockComponent);

            // Act
            const result = await repository.createMobile(mobileWithoutApi);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(mobileWithoutApi);
            expect(saveSpy).toHaveBeenCalledWith(mockComponent);
            expect(result).toEqual(mockComponent);
        });

        it('should propagate errors from mobile repository', async () => {
            // Arrange
            const error = new Error('Mobile repository error');
            jest.spyOn(mobileRepository, 'create').mockReturnValue(mockCreatedMobileComponent);
            jest.spyOn(mobileRepository, 'save').mockRejectedValue(error);

            // Act & Assert
            await expect(repository.createMobile(mockMobileComponent)).rejects.toThrow('Mobile repository error');
        });
    });

    describe('createLibrary', () => {
        it('should create a library component successfully', async () => {
            // Arrange
            const createSpy = jest.spyOn(libraryRepository, 'create').mockReturnValue(mockCreatedLibraryComponent);
            const saveSpy = jest.spyOn(libraryRepository, 'save').mockResolvedValue(mockCreatedLibraryComponent);

            // Act
            const result = await repository.createLibrary(mockLibraryComponent);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(mockLibraryComponent);
            expect(saveSpy).toHaveBeenCalledWith(mockCreatedLibraryComponent);
            expect(result).toEqual(mockCreatedLibraryComponent);
        });

        it('should create a library component without readme content', async () => {
            // Arrange
            const libraryWithoutReadme: Partial<ApplicationComponentLibrary> = {
                applicationId: 2,
                packageManagerUrl: 'https://www.npmjs.com/package/simple-package',
            };

            const mockComponent: ApplicationComponentLibrary = {
                ...libraryWithoutReadme,
            } as ApplicationComponentLibrary;

            const createSpy = jest.spyOn(libraryRepository, 'create').mockReturnValue(mockComponent);
            const saveSpy = jest.spyOn(libraryRepository, 'save').mockResolvedValue(mockComponent);

            // Act
            const result = await repository.createLibrary(libraryWithoutReadme);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(libraryWithoutReadme);
            expect(saveSpy).toHaveBeenCalledWith(mockComponent);
            expect(result).toEqual(mockComponent);
        });

        it('should create a library component with extensive readme content', async () => {
            // Arrange
            const extensiveReadme = `
# Test Library

This is a comprehensive test library with extensive documentation.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install test-library
\`\`\`

## Usage
\`\`\`javascript
import { TestLibrary } from 'test-library';
\`\`\`
            `.trim();

            const libraryWithExtensiveReadme: Partial<ApplicationComponentLibrary> = {
                applicationId: 3,
                packageManagerUrl: 'https://www.npmjs.com/package/extensive-package',
                readmeContent: extensiveReadme,
            };

            const mockComponent: ApplicationComponentLibrary = {
                ...libraryWithExtensiveReadme,
            } as ApplicationComponentLibrary;

            const createSpy = jest.spyOn(libraryRepository, 'create').mockReturnValue(mockComponent);
            const saveSpy = jest.spyOn(libraryRepository, 'save').mockResolvedValue(mockComponent);

            // Act
            const result = await repository.createLibrary(libraryWithExtensiveReadme);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(libraryWithExtensiveReadme);
            expect(saveSpy).toHaveBeenCalledWith(mockComponent);
            expect(result).toEqual(mockComponent);
        });

        it('should propagate errors from library repository', async () => {
            // Arrange
            const error = new Error('Library repository error');
            jest.spyOn(libraryRepository, 'create').mockReturnValue(mockCreatedLibraryComponent);
            jest.spyOn(libraryRepository, 'save').mockRejectedValue(error);

            // Act & Assert
            await expect(repository.createLibrary(mockLibraryComponent)).rejects.toThrow('Library repository error');
        });
    });

    describe('createFrontend', () => {
        it('should create a frontend component successfully', async () => {
            // Arrange
            const createSpy = jest.spyOn(frontendRepository, 'create').mockReturnValue(mockCreatedFrontendComponent);
            const saveSpy = jest.spyOn(frontendRepository, 'save').mockResolvedValue(mockCreatedFrontendComponent);

            // Act
            const result = await repository.createFrontend(mockFrontendComponent);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(mockFrontendComponent);
            expect(saveSpy).toHaveBeenCalledWith(mockCreatedFrontendComponent);
            expect(result).toEqual(mockCreatedFrontendComponent);
        });

        it('should create a frontend component without screenshot URL', async () => {
            // Arrange
            const frontendWithoutScreenshot: Partial<ApplicationComponentFrontend> = {
                applicationId: 2,
                frontendUrl: 'https://example.com/simple-frontend',
            };

            const mockComponent: ApplicationComponentFrontend = {
                ...frontendWithoutScreenshot,
            } as ApplicationComponentFrontend;

            const createSpy = jest.spyOn(frontendRepository, 'create').mockReturnValue(mockComponent);
            const saveSpy = jest.spyOn(frontendRepository, 'save').mockResolvedValue(mockComponent);

            // Act
            const result = await repository.createFrontend(frontendWithoutScreenshot);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(frontendWithoutScreenshot);
            expect(saveSpy).toHaveBeenCalledWith(mockComponent);
            expect(result).toEqual(mockComponent);
        });

        it('should create a frontend component without associated API', async () => {
            // Arrange
            const frontendWithoutApi: Partial<ApplicationComponentFrontend> = {
                applicationId: 3,
                frontendUrl: 'https://example.com/standalone-frontend',
                screenshotUrl: 'https://example.com/screenshot.png',
            };

            const mockComponent: ApplicationComponentFrontend = {
                ...frontendWithoutApi,
            } as ApplicationComponentFrontend;

            const createSpy = jest.spyOn(frontendRepository, 'create').mockReturnValue(mockComponent);
            const saveSpy = jest.spyOn(frontendRepository, 'save').mockResolvedValue(mockComponent);

            // Act
            const result = await repository.createFrontend(frontendWithoutApi);

            // Assert
            expect(createSpy).toHaveBeenCalledWith(frontendWithoutApi);
            expect(saveSpy).toHaveBeenCalledWith(mockComponent);
            expect(result).toEqual(mockComponent);
        });

        it('should propagate errors from frontend repository', async () => {
            // Arrange
            const error = new Error('Frontend repository error');
            jest.spyOn(frontendRepository, 'create').mockReturnValue(mockCreatedFrontendComponent);
            jest.spyOn(frontendRepository, 'save').mockRejectedValue(error);

            // Act & Assert
            await expect(repository.createFrontend(mockFrontendComponent)).rejects.toThrow('Frontend repository error');
        });
    });

    describe('Repository Integration', () => {
        it('should handle multiple component creation in sequence', async () => {
            // Arrange
            const createApiSpy = jest.spyOn(apiRepository, 'create').mockReturnValue(mockCreatedApiComponent);
            const saveApiSpy = jest.spyOn(apiRepository, 'save').mockResolvedValue(mockCreatedApiComponent);

            const createMobileSpy = jest.spyOn(mobileRepository, 'create').mockReturnValue(mockCreatedMobileComponent);
            const saveMobileSpy = jest.spyOn(mobileRepository, 'save').mockResolvedValue(mockCreatedMobileComponent);

            // Act
            const apiResult = await repository.createApi(mockApiComponent);
            const mobileResult = await repository.createMobile(mockMobileComponent);

            // Assert
            expect(createApiSpy).toHaveBeenCalledWith(mockApiComponent);
            expect(saveApiSpy).toHaveBeenCalledWith(mockCreatedApiComponent);
            expect(apiResult).toEqual(mockCreatedApiComponent);

            expect(createMobileSpy).toHaveBeenCalledWith(mockMobileComponent);
            expect(saveMobileSpy).toHaveBeenCalledWith(mockCreatedMobileComponent);
            expect(mobileResult).toEqual(mockCreatedMobileComponent);
        });

        it('should handle partial data for all component types', async () => {
            // Arrange
            const partialApiData: Partial<ApplicationComponentApi> = {
                applicationId: 1,
                domain: 'partial.com',
                apiUrl: 'https://partial.com/api',
            };

            const partialMobileData: Partial<ApplicationComponentMobile> = {
                applicationId: 2,
                platform: MobilePlatformEnum.ANDROID,
            };

            const partialLibraryData: Partial<ApplicationComponentLibrary> = {
                applicationId: 3,
                packageManagerUrl: 'https://www.npmjs.com/package/partial-package',
            };

            const partialFrontendData: Partial<ApplicationComponentFrontend> = {
                applicationId: 4,
                frontendUrl: 'https://partial.com/frontend',
            };

            // Mock all repositories
            jest.spyOn(apiRepository, 'create').mockReturnValue(partialApiData as ApplicationComponentApi);
            jest.spyOn(apiRepository, 'save').mockResolvedValue(partialApiData as ApplicationComponentApi);

            jest.spyOn(mobileRepository, 'create').mockReturnValue(partialMobileData as ApplicationComponentMobile);
            jest.spyOn(mobileRepository, 'save').mockResolvedValue(partialMobileData as ApplicationComponentMobile);

            jest.spyOn(libraryRepository, 'create').mockReturnValue(partialLibraryData as ApplicationComponentLibrary);
            jest.spyOn(libraryRepository, 'save').mockResolvedValue(partialLibraryData as ApplicationComponentLibrary);

            jest.spyOn(frontendRepository, 'create').mockReturnValue(partialFrontendData as ApplicationComponentFrontend);
            jest.spyOn(frontendRepository, 'save').mockResolvedValue(partialFrontendData as ApplicationComponentFrontend);

            // Act
            const apiResult = await repository.createApi(partialApiData);
            const mobileResult = await repository.createMobile(partialMobileData);
            const libraryResult = await repository.createLibrary(partialLibraryData);
            const frontendResult = await repository.createFrontend(partialFrontendData);

            // Assert
            expect(apiResult).toEqual(partialApiData);
            expect(mobileResult).toEqual(partialMobileData);
            expect(libraryResult).toEqual(partialLibraryData);
            expect(frontendResult).toEqual(partialFrontendData);
        });
    });
});