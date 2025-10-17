import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateApplicationDto } from './update-application.dto';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';

describe('UpdateApplicationDto', () => {
    let dto: UpdateApplicationDto;

    beforeEach(() => {
        dto = new UpdateApplicationDto();
    });

    describe('Validation', () => {
        it('should be valid with all fields', async () => {
            // Arrange
            const validData = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/updated-app',
                applicationComponentApi: {
                    domain: 'updated-api.example.com',
                    apiUrl: 'https://updated-api.example.com/v1',
                    documentationUrl: 'https://updated-api.example.com/docs',
                    healthCheckEndpoint: 'https://updated-api.example.com/health',
                },
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with empty object (all fields optional)', async () => {
            // Arrange
            const emptyData = {};

            // Act
            dto = plainToClass(UpdateApplicationDto, emptyData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with only name field', async () => {
            // Arrange
            const partialData = {
                name: 'Updated Name Only',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with only description field', async () => {
            // Arrange
            const partialData = {
                description: 'Updated Description Only',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with only applicationType field', async () => {
            // Arrange
            const partialData = {
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with only githubUrl field', async () => {
            // Arrange
            const partialData = {
                githubUrl: 'https://github.com/test/updated-repo',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, partialData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Field Validation', () => {
        it('should fail validation when name is not a string', async () => {
            // Arrange
            const invalidData = {
                name: 123,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when description is not a string', async () => {
            // Arrange
            const invalidData = {
                description: 123,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when applicationType is not a valid enum value', async () => {
            // Arrange
            const invalidData = {
                applicationType: 'INVALID_TYPE',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('applicationType');
            expect(errors[0].constraints).toHaveProperty('isEnum');
        });

        it('should fail validation when githubUrl is not a valid URL', async () => {
            // Arrange
            const invalidData = {
                githubUrl: 'not-a-valid-url',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('githubUrl');
            expect(errors[0].constraints).toHaveProperty('isUrl');
        });

        it('should pass validation when githubUrl is a valid URL', async () => {
            // Arrange
            const validData = {
                githubUrl: 'https://github.com/user/updated-repo',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when githubUrl is undefined', async () => {
            // Arrange
            const validData: any = {
                githubUrl: undefined,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when githubUrl is null', async () => {
            // Arrange
            const validData: any = {
                githubUrl: null,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Application Type Validation', () => {
        it('should accept API application type', async () => {
            // Arrange
            const validData = {
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept MOBILE application type', async () => {
            // Arrange
            const validData = {
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept LIBRARY application type', async () => {
            // Arrange
            const validData = {
                applicationType: ApplicationTypeEnum.LIBRARY,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept FRONTEND application type', async () => {
            // Arrange
            const validData = {
                applicationType: ApplicationTypeEnum.FRONTEND,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept FULLSTACK application type', async () => {
            // Arrange
            const validData = {
                applicationType: ApplicationTypeEnum.FULLSTACK,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Component Validation', () => {
        it('should validate nested applicationComponentApi', async () => {
            // Arrange
            const validData = {
                applicationComponentApi: {
                    domain: 'updated-api.example.com',
                    apiUrl: 'https://updated-api.example.com/v1',
                    documentationUrl: 'https://updated-api.example.com/docs',
                    healthCheckEndpoint: 'https://updated-api.example.com/health',
                },
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentMobile', async () => {
            // Arrange
            const validData = {
                applicationComponentMobile: {
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: 'https://example.mobile.com/download/2.0.0',
                },
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentLibrary', async () => {
            // Arrange
            const validData = {
                applicationComponentLibrary: {
                    packageManagerUrl: 'https://www.npmjs.com/package/@example/updated-library',
                    readmeContent: 'Updated library description',
                },
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentFrontend', async () => {
            // Arrange
            const validData = {
                applicationComponentFrontend: {
                    frontendUrl: 'https://updated-app.example.com',
                    screenshotUrl: 'https://updated-app.example.com/screenshot',
                },
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when all components are undefined', async () => {
            // Arrange
            const validData: any = {
                applicationComponentApi: undefined,
                applicationComponentMobile: undefined,
                applicationComponentLibrary: undefined,
                applicationComponentFrontend: undefined,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Transformation', () => {
        it('should transform plain object to class instance', () => {
            // Arrange
            const plainData = {
                name: 'Updated Application',
                description: 'Updated Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/updated',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, plainData);

            // Assert
            expect(dto).toBeInstanceOf(UpdateApplicationDto);
            expect(dto.name).toBe('Updated Application');
            expect(dto.description).toBe('Updated Description');
            expect(dto.applicationType).toBe(ApplicationTypeEnum.API);
            expect(dto.githubUrl).toBe('https://github.com/test/updated');
        });

        it('should handle undefined fields', () => {
            // Arrange
            const plainData: any = {
                name: 'Updated Name',
                description: undefined,
                applicationType: undefined,
                githubUrl: undefined,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, plainData);

            // Assert
            expect(dto.name).toBe('Updated Name');
            expect(dto.description).toBeUndefined();
            expect(dto.applicationType).toBeUndefined();
            expect(dto.githubUrl).toBeUndefined();
        });

        it('should handle null fields', () => {
            // Arrange
            const plainData: any = {
                name: 'Updated Name',
                description: null,
                applicationType: null,
                githubUrl: null,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, plainData);

            // Assert
            expect(dto.name).toBe('Updated Name');
            expect(dto.description).toBeNull();
            expect(dto.applicationType).toBeNull();
            expect(dto.githubUrl).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string values', async () => {
            // Arrange
            const dataWithEmptyStrings = {
                name: '',
                description: '',
                githubUrl: '',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, dataWithEmptyStrings);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1); // Only githubUrl should fail (invalid URL)
            expect(errors[0].property).toBe('githubUrl');
        });

        it('should handle whitespace-only values', async () => {
            // Arrange
            const dataWithWhitespace = {
                name: '   ',
                description: '   ',
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, dataWithWhitespace);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0); // Whitespace strings are valid
        });

        it('should handle very long strings', async () => {
            // Arrange
            const longString = 'a'.repeat(1000);
            const dataWithLongStrings = {
                name: longString,
                description: longString,
            };

            // Act
            dto = plainToClass(UpdateApplicationDto, dataWithLongStrings);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0); // Long strings should be valid
        });
    });
});
