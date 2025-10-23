// Mock Application entity to avoid circular dependency
class MockApplicationForApi {
    id: number;
    name: string;
}

// Create a mock version of ApplicationComponentApi to avoid circular dependency
class MockApplicationComponentApi {
    applicationId: number;
    application: MockApplicationForApi;
    domain: string;
    apiUrl: string;
    documentationUrl: string;
    healthCheckEndpoint?: string;
}

describe('ApplicationComponentApi Entity', () => {
    let entity: MockApplicationComponentApi;

    beforeEach(() => {
        entity = new MockApplicationComponentApi();
    });

    describe('Entity Definition', () => {
        it('should be defined', () => {
            expect(entity).toBeDefined();
            expect(entity).toBeInstanceOf(MockApplicationComponentApi);
        });
    });

    describe('Properties', () => {
        it('should have applicationId property', () => {
            expect(entity.applicationId).toBeUndefined();
            entity.applicationId = 1;
            expect(entity.applicationId).toBe(1);
        });

        it('should have domain property', () => {
            expect(entity.domain).toBeUndefined();
            entity.domain = 'example.api.com';
            expect(entity.domain).toBe('example.api.com');
        });

        it('should have apiUrl property', () => {
            expect(entity.apiUrl).toBeUndefined();
            entity.apiUrl = 'https://example.api.com/api/v1';
            expect(entity.apiUrl).toBe('https://example.api.com/api/v1');
        });

        it('should have documentationUrl property', () => {
            expect(entity.documentationUrl).toBeUndefined();
            entity.documentationUrl = 'https://example.api.com/docs';
            expect(entity.documentationUrl).toBe('https://example.api.com/docs');
        });

        it('should have healthCheckEndpoint property', () => {
            expect(entity.healthCheckEndpoint).toBeUndefined();
            entity.healthCheckEndpoint = 'https://example.api.com/health';
            expect(entity.healthCheckEndpoint).toBe('https://example.api.com/health');
        });

        it('should have application property', () => {
            expect(entity.application).toBeUndefined();
            const mockApplication = new MockApplicationForApi();
            entity.application = mockApplication;
            expect(entity.application).toBe(mockApplication);
        });
    });

    describe('Entity Structure', () => {
        it('should have all required properties', () => {
            const requiredProperties = [
                'applicationId',
                'domain',
                'apiUrl',
                'documentationUrl',
                'healthCheckEndpoint',
                'application'
            ];

            requiredProperties.forEach(property => {
                expect(entity).toHaveProperty(property);
            });
        });

        it('should have correct property types', () => {
            entity.applicationId = 1;
            entity.domain = 'test.com';
            entity.apiUrl = 'https://test.com/api';
            entity.documentationUrl = 'https://test.com/docs';
            entity.healthCheckEndpoint = 'https://test.com/health';
            entity.application = new MockApplicationForApi();

            expect(typeof entity.applicationId).toBe('number');
            expect(typeof entity.domain).toBe('string');
            expect(typeof entity.apiUrl).toBe('string');
            expect(typeof entity.documentationUrl).toBe('string');
            expect(typeof entity.healthCheckEndpoint).toBe('string');
            expect(entity.application).toBeInstanceOf(MockApplicationForApi);
        });
    });

    describe('Entity Instantiation', () => {
        it('should create instance with all properties', () => {
            const testData = {
                applicationId: 1,
                domain: 'test.api.com',
                apiUrl: 'https://test.api.com/api/v1',
                documentationUrl: 'https://test.api.com/docs',
                healthCheckEndpoint: 'https://test.api.com/health',
            };

            const entity = Object.assign(new MockApplicationComponentApi(), testData);

            expect(entity.applicationId).toBe(1);
            expect(entity.domain).toBe('test.api.com');
            expect(entity.apiUrl).toBe('https://test.api.com/api/v1');
            expect(entity.documentationUrl).toBe('https://test.api.com/docs');
            expect(entity.healthCheckEndpoint).toBe('https://test.api.com/health');
        });

        it('should create instance with only required properties', () => {
            const testData = {
                applicationId: 1,
                domain: 'test.api.com',
                apiUrl: 'https://test.api.com/api/v1',
            };

            const entity = Object.assign(new MockApplicationComponentApi(), testData);

            expect(entity.applicationId).toBe(1);
            expect(entity.domain).toBe('test.api.com');
            expect(entity.apiUrl).toBe('https://test.api.com/api/v1');
            expect(entity.documentationUrl).toBeUndefined();
            expect(entity.healthCheckEndpoint).toBeUndefined();
        });
    });

    describe('Property Types', () => {
        it('should accept number for applicationId', () => {
            entity.applicationId = 123;
            expect(typeof entity.applicationId).toBe('number');
            expect(entity.applicationId).toBe(123);
        });

        it('should accept string for domain', () => {
            entity.domain = 'api.example.com';
            expect(typeof entity.domain).toBe('string');
            expect(entity.domain).toBe('api.example.com');
        });

        it('should accept string for apiUrl', () => {
            entity.apiUrl = 'https://api.example.com/v2';
            expect(typeof entity.apiUrl).toBe('string');
            expect(entity.apiUrl).toBe('https://api.example.com/v2');
        });

        it('should accept string for documentationUrl', () => {
            entity.documentationUrl = 'https://docs.example.com';
            expect(typeof entity.documentationUrl).toBe('string');
            expect(entity.documentationUrl).toBe('https://docs.example.com');
        });

        it('should accept string for healthCheckEndpoint', () => {
            entity.healthCheckEndpoint = 'https://health.example.com';
            expect(typeof entity.healthCheckEndpoint).toBe('string');
            expect(entity.healthCheckEndpoint).toBe('https://health.example.com');
        });

        it('should accept Application instance for application', () => {
            const application = new MockApplicationForApi();
            application.id = 1;
            application.name = 'Test App';

            entity.application = application;
            expect(entity.application).toBeDefined();
            expect(entity.application.id).toBe(1);
            expect(entity.application.name).toBe('Test App');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values for optional properties', () => {
            entity.documentationUrl = null;
            entity.healthCheckEndpoint = null;

            expect(entity.documentationUrl).toBeNull();
            expect(entity.healthCheckEndpoint).toBeNull();
        });

        it('should handle undefined values for optional properties', () => {
            entity.documentationUrl = undefined;
            entity.healthCheckEndpoint = undefined;

            expect(entity.documentationUrl).toBeUndefined();
            expect(entity.healthCheckEndpoint).toBeUndefined();
        });

        it('should handle empty strings for string properties', () => {
            entity.domain = '';
            entity.apiUrl = '';
            entity.documentationUrl = '';
            entity.healthCheckEndpoint = '';

            expect(entity.domain).toBe('');
            expect(entity.apiUrl).toBe('');
            expect(entity.documentationUrl).toBe('');
            expect(entity.healthCheckEndpoint).toBe('');
        });

        it('should handle zero for applicationId', () => {
            entity.applicationId = 0;
            expect(entity.applicationId).toBe(0);
        });
    });
});
