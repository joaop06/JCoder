import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApplicationComponentLibraryDto } from './application-component-library.dto';

describe('ApplicationComponentLibraryDto', () => {
    let dto: ApplicationComponentLibraryDto;

    beforeEach(() => {
        dto = new ApplicationComponentLibraryDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('packageManagerUrl validation', () => {
        it('should accept valid packageManagerUrl', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.packageManagerUrl).toBe('https://www.npmjs.com/package/your-package');
            expect(errors.length).toBe(0);
        });

        it('should reject empty packageManagerUrl', async () => {
            const plain = {
                packageManagerUrl: '',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('packageManagerUrl');
        });

        it('should reject null packageManagerUrl', async () => {
            const plain = {
                packageManagerUrl: null,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('packageManagerUrl');
        });

        it('should reject undefined packageManagerUrl', async () => {
            const plain = {};

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('packageManagerUrl');
        });

        it('should reject invalid URL format', async () => {
            const plain = {
                packageManagerUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('packageManagerUrl');
        });

        it('should reject non-string packageManagerUrl', async () => {
            const plain = {
                packageManagerUrl: 123,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('packageManagerUrl');
        });

        it('should accept different valid package manager URLs', async () => {
            const validUrls = [
                'https://www.npmjs.com/package/your-package',
                'https://pypi.org/project/your-package/',
                'https://crates.io/crates/your-package',
                'https://packagist.org/packages/vendor/your-package',
                'https://rubygems.org/gems/your-package',
                'https://mvnrepository.com/artifact/group/artifact',
                'https://github.com/user/your-package',
                'https://gitlab.com/user/your-package',
                'https://bitbucket.org/user/your-package',
            ];

            for (const url of validUrls) {
                const plain = { packageManagerUrl: url };
                const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.packageManagerUrl).toBe(url);
            }
        });
    });

    describe('readmeContent validation', () => {
        it('should accept valid optional readmeContent', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: '# Your Package\n\nThis is a great package for...',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBe('# Your Package\n\nThis is a great package for...');
            expect(errors.length).toBe(0);
        });

        it('should accept undefined readmeContent', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBeUndefined();
            expect(errors.length).toBe(0);
        });

        it('should accept null readmeContent', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: null,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBeNull();
            expect(errors.length).toBe(0);
        });

        it('should accept empty string readmeContent', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: '',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBe('');
            expect(errors.length).toBe(0);
        });

        it('should accept long readmeContent', async () => {
            const longReadme = '# Your Package\n\n'.repeat(1000) + 'This is a very long README content.';

            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: longReadme,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBe(longReadme);
            expect(errors.length).toBe(0);
        });

        it('should accept readmeContent with special characters', async () => {
            const specialContent = '# Package with Special Characters\n\n```javascript\nconst code = "test";\n```\n\n- Item 1\n- Item 2\n\n**Bold** and *italic* text.';

            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: specialContent,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.readmeContent).toBe(specialContent);
            expect(errors.length).toBe(0);
        });

        it('should reject non-string readmeContent', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: 123,
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('readmeContent');
        });
    });

    describe('complete validation', () => {
        it('should accept all valid fields', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
                readmeContent: '# Your Package\n\nThis is a great package for...',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.packageManagerUrl).toBe('https://www.npmjs.com/package/your-package');
            expect(dto.readmeContent).toBe('# Your Package\n\nThis is a great package for...');
            expect(errors.length).toBe(0);
        });

        it('should accept only required fields', async () => {
            const plain = {
                packageManagerUrl: 'https://www.npmjs.com/package/your-package',
            };

            const dto = plainToInstance(ApplicationComponentLibraryDto, plain);
            const errors = await validate(dto);

            expect(dto.packageManagerUrl).toBe('https://www.npmjs.com/package/your-package');
            expect(dto.readmeContent).toBeUndefined();
            expect(errors.length).toBe(0);
        });
    });
});
