import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApplicationComponentFrontendDto } from './application-component-frontend.dto';

describe('ApplicationComponentFrontendDto', () => {
    let dto: ApplicationComponentFrontendDto;

    beforeEach(() => {
        dto = new ApplicationComponentFrontendDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('frontendUrl validation', () => {
        it('should accept valid frontendUrl', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.frontendUrl).toBe('https://example.frontend.com');
            expect(errors.length).toBe(0);
        });

        it('should reject empty frontendUrl', async () => {
            const plain = {
                frontendUrl: '',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('frontendUrl');
        });

        it('should reject null frontendUrl', async () => {
            const plain = {
                frontendUrl: null as unknown as string,
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('frontendUrl');
        });

        it('should reject undefined frontendUrl', async () => {
            const plain = {};

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('frontendUrl');
        });

        it('should reject invalid URL format', async () => {
            const plain = {
                frontendUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('frontendUrl');
        });

        it('should reject non-string frontendUrl', async () => {
            const plain = {
                frontendUrl: 123,
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('frontendUrl');
        });

        it('should accept different valid URL formats', async () => {
            const validUrls = [
                'https://example.com',
                'http://example.com',
                'https://subdomain.example.com',
                'https://example.com:8080',
                'https://example.com/path',
                'https://example.com/path?query=value',
                'https://example.com/path#fragment',
            ];

            for (const url of validUrls) {
                const plain = { frontendUrl: url };
                const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.frontendUrl).toBe(url);
            }
        });
    });

    describe('screenshotUrl validation', () => {
        it('should accept valid optional screenshotUrl', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
                screenshotUrl: 'https://example.frontend.com/screenshot',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.screenshotUrl).toBe('https://example.frontend.com/screenshot');
            expect(errors.length).toBe(0);
        });

        it('should accept undefined screenshotUrl', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.screenshotUrl).toBeUndefined();
            expect(errors.length).toBe(0);
        });

        it('should reject invalid screenshotUrl format', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
                screenshotUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('screenshotUrl');
        });

        it('should accept null screenshotUrl', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
                screenshotUrl: null as unknown as string,
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.screenshotUrl).toBeNull();
            expect(errors.length).toBe(0);
        });

        it('should accept different valid screenshotUrl formats', async () => {
            const validUrls = [
                'https://example.com/screenshot',
                'http://example.com/screenshot',
                'https://subdomain.example.com/screenshot',
                'https://example.com:8080/screenshot',
                'https://example.com/screenshot?timestamp=123',
            ];

            for (const url of validUrls) {
                const plain = {
                    frontendUrl: 'https://example.frontend.com',
                    screenshotUrl: url,
                };
                const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.screenshotUrl).toBe(url);
            }
        });
    });

    describe('complete validation', () => {
        it('should accept all valid fields', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
                screenshotUrl: 'https://example.frontend.com/screenshot',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.frontendUrl).toBe('https://example.frontend.com');
            expect(dto.screenshotUrl).toBe('https://example.frontend.com/screenshot');
            expect(errors.length).toBe(0);
        });

        it('should accept only required fields', async () => {
            const plain = {
                frontendUrl: 'https://example.frontend.com',
            };

            const dto = plainToInstance(ApplicationComponentFrontendDto, plain);
            const errors = await validate(dto);

            expect(dto.frontendUrl).toBe('https://example.frontend.com');
            expect(dto.screenshotUrl).toBeUndefined();
            expect(errors.length).toBe(0);
        });
    });
});
