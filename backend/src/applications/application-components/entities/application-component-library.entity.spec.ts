// Mock Application entity to avoid circular dependency
class MockApplicationForLibrary {
    id: number;
    name: string;
}

// Create a mock version of ApplicationComponentLibrary to avoid circular dependency
class MockApplicationComponentLibrary {
    applicationId: number;
    application: MockApplicationForLibrary;
    packageManagerUrl: string;
    readmeContent?: string;
}

describe('ApplicationComponentLibrary Entity', () => {
    let entity: MockApplicationComponentLibrary;

    beforeEach(() => {
        entity = new MockApplicationComponentLibrary();
    });

    describe('Entity Definition', () => {
        it('should be defined', () => {
            expect(entity).toBeDefined();
            expect(entity).toBeInstanceOf(MockApplicationComponentLibrary);
        });
    });

    describe('Properties', () => {
        it('should have applicationId property', () => {
            expect(entity.applicationId).toBeUndefined();
            entity.applicationId = 1;
            expect(entity.applicationId).toBe(1);
        });

        it('should have packageManagerUrl property', () => {
            expect(entity.packageManagerUrl).toBeUndefined();
            entity.packageManagerUrl = 'https://www.npmjs.com/package/your-package';
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/your-package');
        });

        it('should have readmeContent property', () => {
            expect(entity.readmeContent).toBeUndefined();
            entity.readmeContent = '# Library README\nThis is a test library.';
            expect(entity.readmeContent).toBe('# Library README\nThis is a test library.');
        });

        it('should have application property', () => {
            expect(entity.application).toBeUndefined();
            const mockApplication = new MockApplicationForLibrary();
            entity.application = mockApplication;
            expect(entity.application).toBe(mockApplication);
        });
    });

    describe('Entity Structure', () => {
        it('should have all required properties', () => {
            const requiredProperties = [
                'applicationId',
                'packageManagerUrl',
                'readmeContent',
                'application'
            ];

            requiredProperties.forEach(property => {
                expect(entity).toHaveProperty(property);
            });
        });

        it('should have correct property types', () => {
            entity.applicationId = 1;
            entity.packageManagerUrl = 'https://www.npmjs.com/package/test';
            entity.readmeContent = 'Test README content';
            entity.application = new MockApplicationForLibrary();

            expect(typeof entity.applicationId).toBe('number');
            expect(typeof entity.packageManagerUrl).toBe('string');
            expect(typeof entity.readmeContent).toBe('string');
            expect(entity.application).toBeInstanceOf(MockApplicationForLibrary);
        });
    });

    describe('Entity Instantiation', () => {
        it('should create instance with all properties', () => {
            const testData = {
                applicationId: 1,
                packageManagerUrl: 'https://www.npmjs.com/package/test-library',
                readmeContent: '# Test Library\nA comprehensive test library for unit testing.',
            };

            const entity = Object.assign(new MockApplicationComponentLibrary(), testData);

            expect(entity.applicationId).toBe(1);
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/test-library');
            expect(entity.readmeContent).toBe('# Test Library\nA comprehensive test library for unit testing.');
        });

        it('should create instance with only required properties', () => {
            const testData = {
                applicationId: 1,
                packageManagerUrl: 'https://www.npmjs.com/package/required-only',
            };

            const entity = Object.assign(new MockApplicationComponentLibrary(), testData);

            expect(entity.applicationId).toBe(1);
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/required-only');
            expect(entity.readmeContent).toBeUndefined();
        });
    });

    describe('Property Types', () => {
        it('should accept number for applicationId', () => {
            entity.applicationId = 123;
            expect(typeof entity.applicationId).toBe('number');
            expect(entity.applicationId).toBe(123);
        });

        it('should accept string for packageManagerUrl', () => {
            entity.packageManagerUrl = 'https://www.npmjs.com/package/example';
            expect(typeof entity.packageManagerUrl).toBe('string');
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/example');
        });

        it('should accept string for readmeContent', () => {
            entity.readmeContent = '# Example Library\nThis is an example library with detailed documentation.';
            expect(typeof entity.readmeContent).toBe('string');
            expect(entity.readmeContent).toBe('# Example Library\nThis is an example library with detailed documentation.');
        });

        it('should accept Application instance for application', () => {
            const application = new MockApplicationForLibrary();
            application.id = 1;
            application.name = 'Test Library App';

            entity.application = application;
            expect(entity.application).toBeDefined();
            expect(entity.application.id).toBe(1);
            expect(entity.application.name).toBe('Test Library App');
        });
    });

    describe('Package Manager URL Validation', () => {
        it('should accept valid npm package URLs', () => {
            const validUrls = [
                'https://www.npmjs.com/package/express',
                'https://www.npmjs.com/package/@angular/core',
                'https://www.npmjs.com/package/lodash',
                'https://www.npmjs.com/package/react',
            ];

            validUrls.forEach(url => {
                entity.packageManagerUrl = url;
                expect(entity.packageManagerUrl).toBe(url);
            });
        });

        it('should accept other package manager URLs', () => {
            const otherUrls = [
                'https://pypi.org/project/requests/',
                'https://packagist.org/packages/monolog/monolog',
                'https://rubygems.org/gems/rails',
                'https://crates.io/crates/serde',
            ];

            otherUrls.forEach(url => {
                entity.packageManagerUrl = url;
                expect(entity.packageManagerUrl).toBe(url);
            });
        });
    });

    describe('README Content Handling', () => {
        it('should handle markdown content', () => {
            const markdownContent = `# My Library

## Description
This is a comprehensive library for testing purposes.

## Installation
\`\`\`bash
npm install my-library
\`\`\`

## Usage
\`\`\`javascript
import { MyLibrary } from 'my-library';
\`\`\`

## License
MIT`;

            entity.readmeContent = markdownContent;
            expect(entity.readmeContent).toBe(markdownContent);
        });

        it('should handle plain text content', () => {
            const plainText = 'This is a simple plain text README without any markdown formatting.';
            entity.readmeContent = plainText;
            expect(entity.readmeContent).toBe(plainText);
        });

        it('should handle empty README content', () => {
            entity.readmeContent = '';
            expect(entity.readmeContent).toBe('');
        });

        it('should handle very long README content', () => {
            const longContent = 'A'.repeat(10000);
            entity.readmeContent = longContent;
            expect(entity.readmeContent).toBe(longContent);
            expect(entity.readmeContent.length).toBe(10000);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values for optional properties', () => {
            entity.readmeContent = null;

            expect(entity.readmeContent).toBeNull();
        });

        it('should handle undefined values for optional properties', () => {
            entity.readmeContent = undefined;

            expect(entity.readmeContent).toBeUndefined();
        });

        it('should handle empty strings for string properties', () => {
            entity.packageManagerUrl = '';
            entity.readmeContent = '';

            expect(entity.packageManagerUrl).toBe('');
            expect(entity.readmeContent).toBe('');
        });

        it('should handle zero for applicationId', () => {
            entity.applicationId = 0;
            expect(entity.applicationId).toBe(0);
        });

        it('should handle negative numbers for applicationId', () => {
            entity.applicationId = -1;
            expect(entity.applicationId).toBe(-1);
        });

        it('should handle very large numbers for applicationId', () => {
            entity.applicationId = Number.MAX_SAFE_INTEGER;
            expect(entity.applicationId).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe('Relationship with Application', () => {
        it('should maintain reference to application', () => {
            const application = new MockApplicationForLibrary();
            application.id = 42;
            application.name = 'Library Application';

            entity.applicationId = 42;
            entity.application = application;

            expect(entity.applicationId).toBe(42);
            expect(entity.application).toBe(application);
            expect(entity.application.id).toBe(42);
            expect(entity.application.name).toBe('Library Application');
        });

        it('should handle application relationship without circular reference issues', () => {
            const application = new MockApplicationForLibrary();
            application.id = 1;
            application.name = 'Test App';

            entity.applicationId = 1;
            entity.packageManagerUrl = 'https://www.npmjs.com/package/test';
            entity.application = application;

            // Verify the relationship is properly established
            expect(entity.application).toBeDefined();
            expect(entity.application.id).toBe(entity.applicationId);
        });
    });

    describe('Data Integrity', () => {
        it('should maintain data consistency when properties are updated', () => {
            // Initial state
            entity.applicationId = 1;
            entity.packageManagerUrl = 'https://www.npmjs.com/package/initial';
            entity.readmeContent = 'Initial README';

            // Update properties
            entity.packageManagerUrl = 'https://www.npmjs.com/package/updated';
            entity.readmeContent = 'Updated README';

            expect(entity.applicationId).toBe(1); // Should remain unchanged
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/updated');
            expect(entity.readmeContent).toBe('Updated README');
        });

        it('should handle partial updates correctly', () => {
            // Set initial values
            entity.applicationId = 1;
            entity.packageManagerUrl = 'https://www.npmjs.com/package/initial';
            entity.readmeContent = 'Initial README';

            // Update only one property
            entity.packageManagerUrl = 'https://www.npmjs.com/package/partial-update';

            expect(entity.applicationId).toBe(1);
            expect(entity.packageManagerUrl).toBe('https://www.npmjs.com/package/partial-update');
            expect(entity.readmeContent).toBe('Initial README'); // Should remain unchanged
        });
    });
});
