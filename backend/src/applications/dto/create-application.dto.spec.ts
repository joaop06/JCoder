import { CreateApplicationDto } from './create-application.dto';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateApplicationDto', () => {
  it('should be defined', () => {
    const dto = new CreateApplicationDto();
    expect(dto).toBeDefined();
  });

  describe('Validation', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        name: 'Test Application',
        userId: 1,
        description: 'This is a test application',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/user/test-app',
      };

      const dto = plainToInstance(CreateApplicationDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.name).toBe(validData.name);
      expect(dto.userId).toBe(validData.userId);
      expect(dto.description).toBe(validData.description);
      expect(dto.applicationType).toBe(validData.applicationType);
      expect(dto.githubUrl).toBe(validData.githubUrl);
    });

    it('should pass validation with minimal required data', async () => {
      const minimalData = {
        name: 'Minimal App',
        userId: 1,
        description: 'Minimal description',
        applicationType: ApplicationTypeEnum.MOBILE,
      };

      const dto = plainToInstance(CreateApplicationDto, minimalData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.name).toBe(minimalData.name);
      expect(dto.userId).toBe(minimalData.userId);
      expect(dto.description).toBe(minimalData.description);
      expect(dto.applicationType).toBe(minimalData.applicationType);
    });

    it('should fail validation when name is missing', async () => {
      const invalidData = {
        userId: 1,
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'name')).toBe(true);
    });

    it('should fail validation when name is empty string', async () => {
      const invalidData = {
        name: '',
        userId: 1,
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'name')).toBe(true);
    });

    it('should fail validation when userId is missing', async () => {
      const invalidData = {
        name: 'Test App',
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'userId')).toBe(true);
    });

    it('should fail validation when userId is not a number', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 'not-a-number',
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'userId')).toBe(true);
    });

    it('should fail validation when description is missing', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 1,
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'description')).toBe(true);
    });

    it('should fail validation when description is empty string', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 1,
        description: '',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'description')).toBe(true);
    });

    it('should fail validation when applicationType is missing', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'applicationType')).toBe(true);
    });

    it('should fail validation when applicationType is invalid', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
        applicationType: 'INVALID_TYPE',
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'applicationType')).toBe(true);
    });

    it('should fail validation when githubUrl is not a valid URL', async () => {
      const invalidData = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'not-a-valid-url',
      };

      const dto = plainToInstance(CreateApplicationDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.property === 'githubUrl')).toBe(true);
    });

    it('should pass validation when githubUrl is a valid URL', async () => {
      const validData = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/user/repo',
      };

      const dto = plainToInstance(CreateApplicationDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.githubUrl).toBe(validData.githubUrl);
    });

    it('should pass validation when githubUrl is undefined (optional)', async () => {
      const validData = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: undefined,
      };

      const dto = plainToInstance(CreateApplicationDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.githubUrl).toBeUndefined();
    });
  });

  describe('ApplicationTypeEnum values', () => {
    it('should accept API application type', async () => {
      const data = {
        name: 'API App',
        userId: 1,
        description: 'API application',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.applicationType).toBe(ApplicationTypeEnum.API);
    });

    it('should accept MOBILE application type', async () => {
      const data = {
        name: 'Mobile App',
        userId: 1,
        description: 'Mobile application',
        applicationType: ApplicationTypeEnum.MOBILE,
      };

      const dto = plainToInstance(CreateApplicationDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.applicationType).toBe(ApplicationTypeEnum.MOBILE);
    });

    it('should accept LIBRARY application type', async () => {
      const data = {
        name: 'Library App',
        userId: 1,
        description: 'Library application',
        applicationType: ApplicationTypeEnum.LIBRARY,
      };

      const dto = plainToInstance(CreateApplicationDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.applicationType).toBe(ApplicationTypeEnum.LIBRARY);
    });

    it('should accept FRONTEND application type', async () => {
      const data = {
        name: 'Frontend App',
        userId: 1,
        description: 'Frontend application',
        applicationType: ApplicationTypeEnum.FRONTEND,
      };

      const dto = plainToInstance(CreateApplicationDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.applicationType).toBe(ApplicationTypeEnum.FRONTEND);
    });

    it('should accept FULLSTACK application type', async () => {
      const data = {
        name: 'Fullstack App',
        userId: 1,
        description: 'Fullstack application',
        applicationType: ApplicationTypeEnum.FULLSTACK,
      };

      const dto = plainToInstance(CreateApplicationDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.applicationType).toBe(ApplicationTypeEnum.FULLSTACK);
    });
  });

  describe('Type transformation', () => {
    it('should transform string numbers to actual numbers for userId', () => {
      const data = {
        name: 'Test App',
        userId: '123',
        description: 'Test description',
        applicationType: ApplicationTypeEnum.API,
      };

      const dto = plainToInstance(CreateApplicationDto, data, {
        enableImplicitConversion: true,
      });

      expect(typeof dto.userId).toBe('number');
      expect(dto.userId).toBe(123);
    });

    it('should handle string applicationType correctly', () => {
      const data = {
        name: 'Test App',
        userId: 1,
        description: 'Test description',
        applicationType: 'API',
      };

      const dto = plainToInstance(CreateApplicationDto, data);

      expect(dto.applicationType).toBe('API');
    });
  });
});
