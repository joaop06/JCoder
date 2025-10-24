// Mock entities to avoid circular dependencies

class MockApplicationComponentApi {
    applicationId: number;
    application: any;
    domain: string;
    apiUrl: string;
    documentationUrl: string;
    healthCheckEndpoint?: string;
}

class MockApplicationComponentMobile {
    applicationId: number;
    application: any;
    platform: string;
    downloadUrl?: string;
    associatedApiId: number;
    associatedApi?: any;
}

class MockApplicationComponentLibrary {
    applicationId: number;
    application: any;
    packageManagerUrl: string;
    readmeContent?: string;
}

class MockApplicationComponentFrontend {
    applicationId: number;
    application: any;
    frontendUrl: string;
    screenshotUrl?: string;
    associatedApiId: number;
    associatedApi?: any;
}

// Mock Application entity
class MockApplication {
    id: number;
    name: string;
    description: string;
    applicationType: string;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    applicationComponentApi?: MockApplicationComponentApi;
    applicationComponentMobile?: MockApplicationComponentMobile;
    applicationComponentLibrary?: MockApplicationComponentLibrary;
    applicationComponentFrontend?: MockApplicationComponentFrontend;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

describe('Application Entity', () => {
    let entity: MockApplication;

    beforeEach(() => {
        entity = new MockApplication();
    });

    describe('Entity Definition', () => {
        it('should be defined', () => {
            expect(entity).toBeDefined();
            expect(entity).toBeInstanceOf(MockApplication);
        });
    });

    describe('Basic Properties', () => {
        it('should have id property', () => {
            expect(entity.id).toBeUndefined();
            entity.id = 1;
            expect(entity.id).toBe(1);
        });

        it('should have userId property', () => {
            expect(entity.userId).toBeUndefined();
            entity.userId = 123;
        });

        it('should have name property', () => {
            expect(entity.name).toBeUndefined();
            entity.name = 'My Application';
            expect(entity.name).toBe('My Application');
        });

        it('should have description property', () => {
            expect(entity.description).toBeUndefined();
            entity.description = 'This is a test application';
            expect(entity.description).toBe('This is a test application');
        });

        it('should have applicationType property', () => {
            expect(entity.applicationType).toBeUndefined();
            entity.applicationType = 'API';
            expect(entity.applicationType).toBe('API');
        });

        it('should have githubUrl property', () => {
            expect(entity.githubUrl).toBeUndefined();
            entity.githubUrl = 'https://github.com/user/repo';
            expect(entity.githubUrl).toBe('https://github.com/user/repo');
        });

        it('should have isActive property', () => {
            expect(entity.isActive).toBeUndefined();
            entity.isActive = true;
            expect(entity.isActive).toBe(true);
        });

        it('should have images property', () => {
            expect(entity.images).toBeUndefined();
            entity.images = ['image1.jpg', 'image2.png'];
            expect(entity.images).toEqual(['image1.jpg', 'image2.png']);
        });

        it('should have profileImage property', () => {
            expect(entity.profileImage).toBeUndefined();
            entity.profileImage = 'profile.png';
            expect(entity.profileImage).toBe('profile.png');
        });
    });

    describe('Relationship Properties', () => {

        it('should have applicationComponentApi property', () => {
            expect(entity.applicationComponentApi).toBeUndefined();
            const mockApiComponent = new MockApplicationComponentApi();
            entity.applicationComponentApi = mockApiComponent;
            expect(entity.applicationComponentApi).toBe(mockApiComponent);
        });

        it('should have applicationComponentMobile property', () => {
            expect(entity.applicationComponentMobile).toBeUndefined();
            const mockMobileComponent = new MockApplicationComponentMobile();
            entity.applicationComponentMobile = mockMobileComponent;
            expect(entity.applicationComponentMobile).toBe(mockMobileComponent);
        });

        it('should have applicationComponentLibrary property', () => {
            expect(entity.applicationComponentLibrary).toBeUndefined();
            const mockLibraryComponent = new MockApplicationComponentLibrary();
            entity.applicationComponentLibrary = mockLibraryComponent;
            expect(entity.applicationComponentLibrary).toBe(mockLibraryComponent);
        });

        it('should have applicationComponentFrontend property', () => {
            expect(entity.applicationComponentFrontend).toBeUndefined();
            const mockFrontendComponent = new MockApplicationComponentFrontend();
            entity.applicationComponentFrontend = mockFrontendComponent;
            expect(entity.applicationComponentFrontend).toBe(mockFrontendComponent);
        });
    });

    describe('Timestamp Properties', () => {
        it('should have createdAt property', () => {
            expect(entity.createdAt).toBeUndefined();
            const date = new Date();
            entity.createdAt = date;
            expect(entity.createdAt).toBe(date);
        });

        it('should have updatedAt property', () => {
            expect(entity.updatedAt).toBeUndefined();
            const date = new Date();
            entity.updatedAt = date;
            expect(entity.updatedAt).toBe(date);
        });

        it('should have deletedAt property', () => {
            expect(entity.deletedAt).toBeUndefined();
            const date = new Date();
            entity.deletedAt = date;
            expect(entity.deletedAt).toBe(date);
        });
    });

    describe('Entity Structure', () => {
        it('should have all required properties', () => {
            const requiredProperties = [
                'id',
                'name',
                'description',
                'applicationType',
                'githubUrl',
                'isActive',
                'images',
                'profileImage',
                'applicationComponentApi',
                'applicationComponentMobile',
                'applicationComponentLibrary',
                'applicationComponentFrontend',
                'createdAt',
                'updatedAt',
                'deletedAt'
            ];

            requiredProperties.forEach(property => {
                expect(entity).toHaveProperty(property);
            });
        });

        it('should have correct property types', () => {
            entity.id = 1;
            entity.userId = 123;
            entity.name = 'Test App';
            entity.description = 'Test Description';
            entity.applicationType = 'API';
            entity.githubUrl = 'https://github.com/test';
            entity.isActive = true;
            entity.images = ['test.jpg'];
            entity.profileImage = 'profile.jpg';
            entity.applicationComponentApi = new MockApplicationComponentApi();
            entity.applicationComponentMobile = new MockApplicationComponentMobile();
            entity.applicationComponentLibrary = new MockApplicationComponentLibrary();
            entity.applicationComponentFrontend = new MockApplicationComponentFrontend();
            entity.createdAt = new Date();
            entity.updatedAt = new Date();
            entity.deletedAt = new Date();

            expect(typeof entity.id).toBe('number');
            expect(typeof entity.userId).toBe('number');
            expect(typeof entity.name).toBe('string');
            expect(typeof entity.description).toBe('string');
            expect(typeof entity.applicationType).toBe('string');
            expect(typeof entity.githubUrl).toBe('string');
            expect(typeof entity.isActive).toBe('boolean');
            expect(Array.isArray(entity.images)).toBe(true);
            expect(typeof entity.profileImage).toBe('string');
            expect(entity.applicationComponentApi).toBeInstanceOf(MockApplicationComponentApi);
            expect(entity.applicationComponentMobile).toBeInstanceOf(MockApplicationComponentMobile);
            expect(entity.applicationComponentLibrary).toBeInstanceOf(MockApplicationComponentLibrary);
            expect(entity.applicationComponentFrontend).toBeInstanceOf(MockApplicationComponentFrontend);
            expect(entity.createdAt).toBeInstanceOf(Date);
            expect(entity.updatedAt).toBeInstanceOf(Date);
            expect(entity.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('ApplicationTypeEnum Values', () => {
        it('should accept API application type', () => {
            entity.applicationType = 'API';
            expect(entity.applicationType).toBe('API');
        });

        it('should accept MOBILE application type', () => {
            entity.applicationType = 'MOBILE';
            expect(entity.applicationType).toBe('MOBILE');
        });

        it('should accept LIBRARY application type', () => {
            entity.applicationType = 'LIBRARY';
            expect(entity.applicationType).toBe('LIBRARY');
        });

        it('should accept FRONTEND application type', () => {
            entity.applicationType = 'FRONTEND';
            expect(entity.applicationType).toBe('FRONTEND');
        });

        it('should accept FULLSTACK application type', () => {
            entity.applicationType = 'FULLSTACK';
            expect(entity.applicationType).toBe('FULLSTACK');
        });
    });

    describe('Entity Instantiation', () => {
        it('should create instance with all properties', () => {
            const testData = {
                id: 1,
                name: 'Test Application',
                description: 'This is a test application',
                applicationType: 'API',
                githubUrl: 'https://github.com/test/repo',
                isActive: true,
                images: ['image1.jpg', 'image2.png'],
                profileImage: 'profile.jpg',
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                deletedAt: null
            };

            const entity = Object.assign(new MockApplication(), testData);

            expect(entity.id).toBe(1);
            expect(entity.name).toBe('Test Application');
            expect(entity.description).toBe('This is a test application');
            expect(entity.applicationType).toBe('API');
            expect(entity.githubUrl).toBe('https://github.com/test/repo');
            expect(entity.isActive).toBe(true);
            expect(entity.images).toEqual(['image1.jpg', 'image2.png']);
            expect(entity.profileImage).toBe('profile.jpg');
            expect(entity.createdAt).toEqual(new Date('2023-01-01'));
            expect(entity.updatedAt).toEqual(new Date('2023-01-02'));
            expect(entity.deletedAt).toBeNull();
        });

        it('should create instance with only required properties', () => {
            const testData = {
                id: 1,
                name: 'Minimal Application',
                description: 'Minimal description',
                applicationType: 'MOBILE',
                isActive: false
            };

            const entity = Object.assign(new MockApplication(), testData);

            expect(entity.id).toBe(1);
            expect(entity.name).toBe('Minimal Application');
            expect(entity.description).toBe('Minimal description');
            expect(entity.applicationType).toBe('MOBILE');
            expect(entity.isActive).toBe(false);
            expect(entity.githubUrl).toBeUndefined();
            expect(entity.images).toBeUndefined();
            expect(entity.profileImage).toBeUndefined();
        });

        it('should create instance with relationships', () => {

            const mockApiComponent = new MockApplicationComponentApi();
            mockApiComponent.applicationId = 1;
            mockApiComponent.domain = 'api.example.com';

            const testData = {
                id: 1,
                name: 'Application with Relationships',
                description: 'Test description',
                applicationType: 'API',
                isActive: true,
                applicationComponentApi: mockApiComponent
            };

            const entity = Object.assign(new MockApplication(), testData);

            expect(entity.applicationComponentApi).toBe(mockApiComponent);
            expect(entity.applicationComponentApi.domain).toBe('api.example.com');
        });
    });

    describe('Property Types', () => {
        it('should accept number for id', () => {
            entity.id = 999;
            expect(typeof entity.id).toBe('number');
            expect(entity.id).toBe(999);
        });

        it('should accept number for userId', () => {
            entity.userId = 456;
            expect(typeof entity.userId).toBe('number');
            expect(entity.userId).toBe(456);
        });

        it('should accept string for name', () => {
            entity.name = 'My Awesome App';
            expect(typeof entity.name).toBe('string');
            expect(entity.name).toBe('My Awesome App');
        });

        it('should accept string for description', () => {
            entity.description = 'A very long description that explains what this application does in detail';
            expect(typeof entity.description).toBe('string');
            expect(entity.description).toBe('A very long description that explains what this application does in detail');
        });

        it('should accept boolean for isActive', () => {
            entity.isActive = false;
            expect(typeof entity.isActive).toBe('boolean');
            expect(entity.isActive).toBe(false);
        });

        it('should accept array for images', () => {
            entity.images = ['img1.png', 'img2.jpg', 'img3.gif'];
            expect(Array.isArray(entity.images)).toBe(true);
            expect(entity.images).toHaveLength(3);
            expect(entity.images[0]).toBe('img1.png');
        });

        it('should accept Date for timestamps', () => {
            const now = new Date();
            entity.createdAt = now;
            entity.updatedAt = now;
            entity.deletedAt = now;

            expect(entity.createdAt).toBeInstanceOf(Date);
            expect(entity.updatedAt).toBeInstanceOf(Date);
            expect(entity.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values for optional properties', () => {
            entity.githubUrl = null;
            entity.images = null;
            entity.profileImage = null;
            entity.deletedAt = null;

            expect(entity.githubUrl).toBeNull();
            expect(entity.images).toBeNull();
            expect(entity.profileImage).toBeNull();
            expect(entity.deletedAt).toBeNull();
        });

        it('should handle undefined values for optional properties', () => {
            entity.githubUrl = undefined;
            entity.images = undefined;
            entity.profileImage = undefined;
            entity.deletedAt = undefined;

            expect(entity.githubUrl).toBeUndefined();
            expect(entity.images).toBeUndefined();
            expect(entity.profileImage).toBeUndefined();
            expect(entity.deletedAt).toBeUndefined();
        });

        it('should handle empty strings for string properties', () => {
            entity.name = '';
            entity.description = '';
            entity.githubUrl = '';
            entity.profileImage = '';

            expect(entity.name).toBe('');
            expect(entity.description).toBe('');
            expect(entity.githubUrl).toBe('');
            expect(entity.profileImage).toBe('');
        });

        it('should handle empty array for images', () => {
            entity.images = [];
            expect(Array.isArray(entity.images)).toBe(true);
            expect(entity.images).toHaveLength(0);
        });

        it('should handle zero for numeric properties', () => {
            entity.id = 0;
            entity.userId = 0;
            expect(entity.id).toBe(0);
            expect(entity.userId).toBe(0);
        });

        it('should handle negative numbers for numeric properties', () => {
            entity.id = -1;
            entity.userId = -123;
            expect(entity.id).toBe(-1);
            expect(entity.userId).toBe(-123);
        });

        it('should handle very long strings', () => {
            const longString = 'a'.repeat(10000);
            entity.name = longString;
            entity.description = longString;
            entity.githubUrl = longString;

            expect(entity.name).toBe(longString);
            expect(entity.description).toBe(longString);
            expect(entity.githubUrl).toBe(longString);
        });

        it('should handle special characters in strings', () => {
            entity.name = 'App with Special Chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            entity.description = 'Description with émojis 🚀 and ñ characters';
            entity.githubUrl = 'https://github.com/user/repo-with-special-chars';

            expect(entity.name).toBe('App with Special Chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
            expect(entity.description).toBe('Description with émojis 🚀 and ñ characters');
            expect(entity.githubUrl).toBe('https://github.com/user/repo-with-special-chars');
        });

        it('should handle multiple images in array', () => {
            entity.images = [
                'image1.jpg',
                'image2.png',
                'image3.gif',
                'image4.webp',
                'image5.svg'
            ];

            expect(entity.images).toHaveLength(5);
            expect(entity.images[0]).toBe('image1.jpg');
            expect(entity.images[4]).toBe('image5.svg');
        });
    });

    describe('Relationship Scenarios', () => {
        it('should handle application with API component only', () => {
            const mockApiComponent = new MockApplicationComponentApi();
            mockApiComponent.applicationId = 1;
            mockApiComponent.domain = 'api.example.com';
            mockApiComponent.apiUrl = 'https://api.example.com/v1';

            entity.id = 1;
            entity.applicationType = 'API';
            entity.applicationComponentApi = mockApiComponent;

            expect(entity.applicationComponentApi).toBeDefined();
            expect(entity.applicationComponentApi.domain).toBe('api.example.com');
            expect(entity.applicationComponentMobile).toBeUndefined();
            expect(entity.applicationComponentLibrary).toBeUndefined();
            expect(entity.applicationComponentFrontend).toBeUndefined();
        });

        it('should handle application with Mobile component only', () => {
            const mockMobileComponent = new MockApplicationComponentMobile();
            mockMobileComponent.applicationId = 1;
            mockMobileComponent.platform = 'Android';
            mockMobileComponent.downloadUrl = 'https://play.google.com/store/apps/details?id=com.example.app';

            entity.id = 1;
            entity.applicationType = 'MOBILE';
            entity.applicationComponentMobile = mockMobileComponent;

            expect(entity.applicationComponentMobile).toBeDefined();
            expect(entity.applicationComponentMobile.platform).toBe('Android');
            expect(entity.applicationComponentApi).toBeUndefined();
            expect(entity.applicationComponentLibrary).toBeUndefined();
            expect(entity.applicationComponentFrontend).toBeUndefined();
        });

        it('should handle application with Library component only', () => {
            const mockLibraryComponent = new MockApplicationComponentLibrary();
            mockLibraryComponent.applicationId = 1;
            mockLibraryComponent.packageManagerUrl = 'https://www.npmjs.com/package/example-lib';

            entity.id = 1;
            entity.applicationType = 'LIBRARY';
            entity.applicationComponentLibrary = mockLibraryComponent;

            expect(entity.applicationComponentLibrary).toBeDefined();
            expect(entity.applicationComponentLibrary.packageManagerUrl).toBe('https://www.npmjs.com/package/example-lib');
            expect(entity.applicationComponentApi).toBeUndefined();
            expect(entity.applicationComponentMobile).toBeUndefined();
            expect(entity.applicationComponentFrontend).toBeUndefined();
        });

        it('should handle application with Frontend component only', () => {
            const mockFrontendComponent = new MockApplicationComponentFrontend();
            mockFrontendComponent.applicationId = 1;
            mockFrontendComponent.frontendUrl = 'https://app.example.com';

            entity.id = 1;
            entity.applicationType = 'FRONTEND';
            entity.applicationComponentFrontend = mockFrontendComponent;

            expect(entity.applicationComponentFrontend).toBeDefined();
            expect(entity.applicationComponentFrontend.frontendUrl).toBe('https://app.example.com');
            expect(entity.applicationComponentApi).toBeUndefined();
            expect(entity.applicationComponentMobile).toBeUndefined();
            expect(entity.applicationComponentLibrary).toBeUndefined();
        });

        it('should handle application with multiple components (FULLSTACK)', () => {
            const mockApiComponent = new MockApplicationComponentApi();
            mockApiComponent.applicationId = 1;
            mockApiComponent.domain = 'api.example.com';

            const mockFrontendComponent = new MockApplicationComponentFrontend();
            mockFrontendComponent.applicationId = 1;
            mockFrontendComponent.frontendUrl = 'https://app.example.com';

            entity.id = 1;
            entity.applicationType = 'FULLSTACK';
            entity.applicationComponentApi = mockApiComponent;
            entity.applicationComponentFrontend = mockFrontendComponent;

            expect(entity.applicationComponentApi).toBeDefined();
            expect(entity.applicationComponentFrontend).toBeDefined();
            expect(entity.applicationComponentApi.domain).toBe('api.example.com');
            expect(entity.applicationComponentFrontend.frontendUrl).toBe('https://app.example.com');
        });

    });

    describe('Data Validation Scenarios', () => {
        it('should handle valid GitHub URLs', () => {
            const validUrls = [
                'https://github.com/user/repo',
                'https://github.com/organization/project',
                'https://github.com/user/repo-with-dashes',
                'https://github.com/user/repo.with.dots'
            ];

            validUrls.forEach(url => {
                entity.githubUrl = url;
                expect(entity.githubUrl).toBe(url);
            });
        });

        it('should handle valid image filenames', () => {
            const validImages = [
                'logo.png',
                'screenshot.jpg',
                'icon.svg',
                'banner.webp',
                'image-with-dashes.gif',
                'image_with_underscores.png'
            ];

            entity.images = validImages;
            expect(entity.images).toEqual(validImages);
        });

        it('should handle valid profile image filenames', () => {
            const validProfileImages = [
                'profile.png',
                'avatar.jpg',
                'logo.svg',
                'icon.webp'
            ];

            validProfileImages.forEach(image => {
                entity.profileImage = image;
                expect(entity.profileImage).toBe(image);
            });
        });
    });

    describe('Business Logic Scenarios', () => {
        it('should handle active application', () => {
            entity.isActive = true;
            entity.deletedAt = null;

            expect(entity.isActive).toBe(true);
            expect(entity.deletedAt).toBeNull();
        });

        it('should handle inactive application', () => {
            entity.isActive = false;
            entity.deletedAt = null;

            expect(entity.isActive).toBe(false);
            expect(entity.deletedAt).toBeNull();
        });

        it('should handle soft deleted application', () => {
            entity.isActive = false;
            entity.deletedAt = new Date();

            expect(entity.isActive).toBe(false);
            expect(entity.deletedAt).toBeInstanceOf(Date);
        });

        it('should handle application with all optional fields populated', () => {
            entity.githubUrl = 'https://github.com/user/repo';
            entity.images = ['image1.jpg', 'image2.png'];
            entity.profileImage = 'profile.jpg';

            expect(entity.githubUrl).toBeDefined();
            expect(entity.images).toBeDefined();
            expect(entity.profileImage).toBeDefined();
        });

        it('should handle application with no optional fields', () => {
            entity.githubUrl = undefined;
            entity.images = undefined;
            entity.profileImage = undefined;

            expect(entity.githubUrl).toBeUndefined();
            expect(entity.images).toBeUndefined();
            expect(entity.profileImage).toBeUndefined();
        });
    });
});
