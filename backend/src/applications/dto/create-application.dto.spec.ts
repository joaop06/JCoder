import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateApplicationDto } from './create-application.dto';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { MobilePlatformEnum } from '../enums/mobile-platform.enum';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';

describe('CreateApplicationDto', () => {
    let dto: CreateApplicationDto;

    beforeEach(() => {
        dto = new CreateApplicationDto();
    });

    describe('Validation', () => {
        it('should be valid with all required fields', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/app',
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                    documentationUrl: 'https://api.example.com/docs',
                    healthCheckEndpoint: 'https://api.example.com/health',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should be valid with minimal required fields', async () => {
            // Arrange
            const minimalData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, minimalData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when name is missing', async () => {
            // Arrange
            const invalidData = {
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when name is empty string', async () => {
            // Arrange
            const invalidData = {
                name: '',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when name is not a string', async () => {
            // Arrange
            const invalidData = {
                name: 123,
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when userId is missing', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when userId is not a number', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 'not-a-number',
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNumber');
        });

        it('should fail validation when description is missing', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when description is empty string', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                description: '',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when description is not a string', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                description: 123,
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when applicationType is missing', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('applicationType');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when applicationType is not a valid enum value', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: 'INVALID_TYPE',
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('applicationType');
            expect(errors[0].constraints).toHaveProperty('isEnum');
        });

        it('should fail validation when githubUrl is not a valid URL', async () => {
            // Arrange
            const invalidData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'not-a-valid-url',
            };

            // Act
            dto = plainToClass(CreateApplicationDto, invalidData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('githubUrl');
            expect(errors[0].constraints).toHaveProperty('isUrl');
        });

        it('should pass validation when githubUrl is a valid URL', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/user/repo',
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when githubUrl is undefined', async () => {
            // Arrange
            const validData: any = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: undefined,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Application Type Validation', () => {
        it('should accept API application type', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept MOBILE application type', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept LIBRARY application type', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept FRONTEND application type', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should accept FULLSTACK application type', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FULLSTACK,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Component Validation', () => {
        it('should validate nested applicationComponentApi', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                applicationComponentApi: {
                    domain: 'api.example.com',
                    apiUrl: 'https://api.example.com/v1',
                    documentationUrl: 'https://api.example.com/docs',
                    healthCheckEndpoint: 'https://api.example.com/health',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentMobile', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.MOBILE,
                applicationComponentMobile: {
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: 'https://example.mobile.com/download/1.0.0',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentLibrary', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.LIBRARY,
                applicationComponentLibrary: {
                    packageManagerUrl: 'https://www.npmjs.com/package/@example/library',
                    readmeContent: 'Library description',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('should validate nested applicationComponentFrontend', async () => {
            // Arrange
            const validData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.FRONTEND,
                applicationComponentFrontend: {
                    frontendUrl: 'https://app.example.com',
                    screenshotUrl: 'https://app.example.com/screenshot',
                },
            };

            // Act
            dto = plainToClass(CreateApplicationDto, validData);
            const errors = await validate(dto);

            // Assert
            expect(errors).toHaveLength(0);
        });
    });

    describe('Transformation', () => {
        it('should transform plain object to class instance', () => {
            // Arrange
            const plainData = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, plainData);

            // Assert
            expect(dto).toBeInstanceOf(CreateApplicationDto);
            expect(dto.name).toBe('Test Application');
            expect(dto.userId).toBe(1);
            expect(dto.description).toBe('Test Description');
            expect(dto.applicationType).toBe(ApplicationTypeEnum.API);
        });

        it('should handle undefined optional fields', () => {
            // Arrange
            const plainData: any = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: undefined,
                applicationComponentApi: undefined,
            };

            // Act
            dto = plainToClass(CreateApplicationDto, plainData);

            // Assert
            expect(dto.githubUrl).toBeUndefined();
            expect(dto.applicationComponentApi).toBeUndefined();
        });
    });
});
