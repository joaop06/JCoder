import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApplicationComponentApiDto } from './application-component-api.dto';

describe('ApplicationComponentApiDto', () => {
    let dto: ApplicationComponentApiDto;

    beforeEach(() => {
        dto = new ApplicationComponentApiDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('domain validation', () => {
        it('should accept valid domain', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.domain).toBe('example.api.com');
            expect(errors.length).toBe(0);
        });

        it('should reject empty domain', async () => {
            const plain = {
                domain: '',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('domain');
        });

        it('should reject null domain', async () => {
            const plain = {
                domain: null as any,
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('domain');
        });

        it('should reject undefined domain', async () => {
            const plain = {
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('domain');
        });

        it('should reject non-string domain', async () => {
            const plain = {
                domain: 123 as any,
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('domain');
        });
    });

    describe('apiUrl validation', () => {
        it('should accept valid URL', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.apiUrl).toBe('https://example.api.com/api/v1');
            expect(errors.length).toBe(0);
        });

        it('should reject empty apiUrl', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: '',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('apiUrl');
        });

        it('should reject invalid URL format', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('apiUrl');
        });

        it('should reject null apiUrl', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: null as any,
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('apiUrl');
        });

        it('should reject undefined apiUrl', async () => {
            const plain = {
                domain: 'example.api.com',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('apiUrl');
        });
    });

    describe('documentationUrl validation', () => {
        it('should accept valid optional documentationUrl', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                documentationUrl: 'https://example.api.com/docs',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.documentationUrl).toBe('https://example.api.com/docs');
            expect(errors.length).toBe(0);
        });

        it('should accept undefined documentationUrl', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.documentationUrl).toBeUndefined();
            expect(errors.length).toBe(0);
        });

        it('should reject invalid documentationUrl format', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                documentationUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('documentationUrl');
        });

        it('should accept null documentationUrl', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                documentationUrl: null as any,
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.documentationUrl).toBeNull();
            expect(errors.length).toBe(0);
        });
    });

    describe('healthCheckEndpoint validation', () => {
        it('should accept valid optional healthCheckEndpoint', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                healthCheckEndpoint: 'https://example.api.com/health',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.healthCheckEndpoint).toBe('https://example.api.com/health');
            expect(errors.length).toBe(0);
        });

        it('should accept undefined healthCheckEndpoint', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.healthCheckEndpoint).toBeUndefined();
            expect(errors.length).toBe(0);
        });

        it('should reject invalid healthCheckEndpoint format', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                healthCheckEndpoint: 'not-a-valid-url',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('healthCheckEndpoint');
        });

        it('should accept null healthCheckEndpoint', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                healthCheckEndpoint: null as any,
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.healthCheckEndpoint).toBeNull();
            expect(errors.length).toBe(0);
        });
    });

    describe('complete validation', () => {
        it('should accept all valid fields', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
                documentationUrl: 'https://example.api.com/docs',
                healthCheckEndpoint: 'https://example.api.com/health',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.domain).toBe('example.api.com');
            expect(dto.apiUrl).toBe('https://example.api.com/api/v1');
            expect(dto.documentationUrl).toBe('https://example.api.com/docs');
            expect(dto.healthCheckEndpoint).toBe('https://example.api.com/health');
            expect(errors.length).toBe(0);
        });

        it('should accept only required fields', async () => {
            const plain = {
                domain: 'example.api.com',
                apiUrl: 'https://example.api.com/api/v1',
            };

            const dto = plainToInstance(ApplicationComponentApiDto, plain);
            const errors = await validate(dto);

            expect(dto.domain).toBe('example.api.com');
            expect(dto.apiUrl).toBe('https://example.api.com/api/v1');
            expect(dto.documentationUrl).toBeUndefined();
            expect(dto.healthCheckEndpoint).toBeUndefined();
            expect(errors.length).toBe(0);
        });
    });
});
