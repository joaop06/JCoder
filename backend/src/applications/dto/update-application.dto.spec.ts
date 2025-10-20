import { UpdateApplicationDto } from './update-application.dto';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdateApplicationDto', () => {
    it('should be defined', () => {
        const dto = new UpdateApplicationDto();
        expect(dto).toBeDefined();
    });

    describe('Validation', () => {
        it('should pass validation with all fields', async () => {
            const validData = {
                name: 'Updated Application',
                description: 'Updated description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                githubUrl: 'https://github.com/user/updated-app',
            };

            const dto = plainToInstance(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBe(validData.name);
            expect(dto.description).toBe(validData.description);
            expect(dto.applicationType).toBe(validData.applicationType);
            expect(dto.githubUrl).toBe(validData.githubUrl);
        });

        it('should pass validation with only name field', async () => {
            const partialData = {
                name: 'Updated Name Only',
            };

            const dto = plainToInstance(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBe(partialData.name);
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBeUndefined();
            expect(dto.githubUrl).toBeUndefined();
        });

        it('should pass validation with only description field', async () => {
            const partialData = {
                description: 'Updated description only',
            };

            const dto = plainToInstance(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBeUndefined();
            expect(dto.description).toBe(partialData.description);
            expect(dto.applicationType).toBeUndefined();
            expect(dto.githubUrl).toBeUndefined();
        });

        it('should pass validation with only applicationType field', async () => {
            const partialData = {
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            const dto = plainToInstance(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBeUndefined();
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBe(partialData.applicationType);
            expect(dto.githubUrl).toBeUndefined();
        });

        it('should pass validation with only githubUrl field', async () => {
            const partialData = {
                githubUrl: 'https://github.com/user/new-repo',
            };

            const dto = plainToInstance(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBeUndefined();
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBeUndefined();
            expect(dto.githubUrl).toBe(partialData.githubUrl);
        });

        it('should pass validation with empty object (all fields optional)', async () => {
            const emptyData = {};

            const dto = plainToInstance(UpdateApplicationDto, emptyData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBeUndefined();
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBeUndefined();
            expect(dto.githubUrl).toBeUndefined();
        });

        it('should pass validation when name is empty string (optional field)', async () => {
            const data = {
                name: '',
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBe('');
        });

        it('should pass validation when description is empty string (optional field)', async () => {
            const data = {
                description: '',
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.description).toBe('');
        });

        it('should fail validation when applicationType is invalid', async () => {
            const invalidData = {
                applicationType: 'INVALID_TYPE',
            };

            const dto = plainToInstance(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => error.property === 'applicationType')).toBe(true);
        });

        it('should fail validation when githubUrl is not a valid URL', async () => {
            const invalidData = {
                githubUrl: 'not-a-valid-url',
            };

            const dto = plainToInstance(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => error.property === 'githubUrl')).toBe(true);
        });

        it('should pass validation when githubUrl is a valid URL', async () => {
            const validData = {
                githubUrl: 'https://github.com/user/valid-repo',
            };

            const dto = plainToInstance(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.githubUrl).toBe(validData.githubUrl);
        });

        it('should pass validation when githubUrl is null (optional)', async () => {
            const validData = {
                githubUrl: null,
            };

            const dto = plainToInstance(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.githubUrl).toBeNull();
        });

        it('should pass validation when githubUrl is undefined (optional)', async () => {
            const validData = {
                githubUrl: undefined,
            };

            const dto = plainToInstance(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.githubUrl).toBeUndefined();
        });
    });

    describe('ApplicationTypeEnum values', () => {
        it('should accept API application type', async () => {
            const data = {
                applicationType: ApplicationTypeEnum.API,
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.applicationType).toBe(ApplicationTypeEnum.API);
        });

        it('should accept MOBILE application type', async () => {
            const data = {
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.applicationType).toBe(ApplicationTypeEnum.MOBILE);
        });

        it('should accept LIBRARY application type', async () => {
            const data = {
                applicationType: ApplicationTypeEnum.LIBRARY,
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.applicationType).toBe(ApplicationTypeEnum.LIBRARY);
        });

        it('should accept FRONTEND application type', async () => {
            const data = {
                applicationType: ApplicationTypeEnum.FRONTEND,
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.applicationType).toBe(ApplicationTypeEnum.FRONTEND);
        });

        it('should accept FULLSTACK application type', async () => {
            const data = {
                applicationType: ApplicationTypeEnum.FULLSTACK,
            };

            const dto = plainToInstance(UpdateApplicationDto, data);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.applicationType).toBe(ApplicationTypeEnum.FULLSTACK);
        });
    });

    describe('Type transformation', () => {
        it('should handle string applicationType correctly', () => {
            const data = {
                applicationType: 'FRONTEND',
            };

            const dto = plainToInstance(UpdateApplicationDto, data);

            expect(dto.applicationType).toBe('FRONTEND');
        });

        it('should preserve string values for name and description', () => {
            const data = {
                name: 'Updated Name',
                description: 'Updated Description',
            };

            const dto = plainToInstance(UpdateApplicationDto, data);

            expect(typeof dto.name).toBe('string');
            expect(typeof dto.description).toBe('string');
            expect(dto.name).toBe('Updated Name');
            expect(dto.description).toBe('Updated Description');
        });
    });

    describe('Partial updates', () => {
        it('should allow updating only specific fields', async () => {
            const updateData = {
                name: 'New Name',
                githubUrl: 'https://github.com/user/new-repo',
            };

            const dto = plainToInstance(UpdateApplicationDto, updateData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.name).toBe('New Name');
            expect(dto.githubUrl).toBe('https://github.com/user/new-repo');
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBeUndefined();
        });

        it('should allow updating with mixed valid and invalid data', async () => {
            const mixedData = {
                name: 'Valid Name',
                description: 'Valid description', // Valid: non-empty string
                applicationType: ApplicationTypeEnum.API, // Valid
                githubUrl: 'invalid-url', // Invalid: not a URL
            };

            const dto = plainToInstance(UpdateApplicationDto, mixedData);
            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            // Should have errors for githubUrl only
            expect(errors.some(error => error.property === 'githubUrl')).toBe(true);
            // Should not have errors for name, description, and applicationType
            expect(errors.some(error => error.property === 'name')).toBe(false);
            expect(errors.some(error => error.property === 'description')).toBe(false);
            expect(errors.some(error => error.property === 'applicationType')).toBe(false);
        });
    });
});
