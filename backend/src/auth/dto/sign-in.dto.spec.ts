import { SignInDto } from './sign-in.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('SignInDto', () => {
    it('should be defined', () => {
        const dto = new SignInDto();
        expect(dto).toBeDefined();
    });

    describe('Validation', () => {
        it('should pass validation with valid data', async () => {
            const validData = {
                email: 'test@example.com',
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.email).toBe(validData.email);
            expect(dto.password).toBe(validData.password);
        });

        it('should fail validation when email is missing', async () => {
            const invalidData = {
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when password is missing', async () => {
            const invalidData = {
                email: 'test@example.com',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when email is empty string', async () => {
            const invalidData = {
                email: '',
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when password is empty string', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: '',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when email is not a valid email format', async () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should fail validation when email is not a string', async () => {
            const invalidData = {
                email: 123,
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when password is not a string', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: 123,
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when both email and password are missing', async () => {
            const invalidData = {};

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(2);
            expect(errors.some(error => error.property === 'email')).toBe(true);
            expect(errors.some(error => error.property === 'password')).toBe(true);
        });

        it('should fail validation when email is null', async () => {
            const invalidData = {
                email: null,
                password: 'ValidPassword123!',
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when password is null', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: null,
            };

            const dto = plainToInstance(SignInDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should pass validation with various valid email formats', async () => {
            const validEmails = [
                'user@domain.com',
                'user.name@domain.com',
                'user+tag@domain.co.uk',
                'user123@subdomain.domain.com',
                'test.email+tag@example-domain.com',
            ];

            for (const email of validEmails) {
                const validData = {
                    email,
                    password: 'ValidPassword123!',
                };

                const dto = plainToInstance(SignInDto, validData);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.email).toBe(email);
            }
        });

        it('should fail validation with various invalid email formats', async () => {
            const invalidEmails = [
                'plainaddress',
                '@domain.com',
                'user@',
                'user@domain',
                'user..name@domain.com',
                'user@domain..com',
                'user@domain.com.',
                'user name@domain.com',
                'user@domain com',
            ];

            for (const email of invalidEmails) {
                const invalidData = {
                    email,
                    password: 'ValidPassword123!',
                };

                const dto = plainToInstance(SignInDto, invalidData);
                const errors = await validate(dto);

                expect(errors.length).toBe(1);
                expect(errors[0].property).toBe('email');
                expect(errors[0].constraints).toHaveProperty('isEmail');
            }
        });
    });

    describe('Property Assignment', () => {
        it('should correctly assign email property', () => {
            const dto = new SignInDto();
            const email = 'test@example.com';

            dto.email = email;

            expect(dto.email).toBe(email);
        });

        it('should correctly assign password property', () => {
            const dto = new SignInDto();
            const password = 'ValidPassword123!';

            dto.password = password;

            expect(dto.password).toBe(password);
        });

        it('should handle special characters in password', () => {
            const dto = new SignInDto();
            const password = 'P@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?';

            dto.password = password;

            expect(dto.password).toBe(password);
        });

        it('should handle unicode characters in email', () => {
            const dto = new SignInDto();
            const email = 'tëst@ëxämplé.com';

            dto.email = email;

            expect(dto.email).toBe(email);
        });
    });
});
