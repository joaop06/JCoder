import { SignInDto } from './sign-in.dto';
import { validate } from 'class-validator';

describe('SignInDto', () => {
    let dto: SignInDto;

    beforeEach(() => {
        dto = new SignInDto();
    });

    describe('email validation', () => {
        it('should pass validation with valid email', async () => {
            dto.email = 'test@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with invalid email format', async () => {
            dto.email = 'invalid-email';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should fail validation with empty email', async () => {
            dto.email = '';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with null email', async () => {
            dto.email = null as any;
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with undefined email', async () => {
            dto.email = undefined as any;
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with non-string email', async () => {
            dto.email = 123 as any;
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('password validation', () => {
        it('should pass validation with valid password', async () => {
            dto.email = 'test@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with empty password', async () => {
            dto.email = 'test@example.com';
            dto.password = '';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with null password', async () => {
            dto.email = 'test@example.com';
            dto.password = null as any;

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with undefined password', async () => {
            dto.email = 'test@example.com';
            dto.password = undefined as any;

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with non-string password', async () => {
            dto.email = 'test@example.com';
            dto.password = 123 as any;

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('complete validation', () => {
        it('should pass validation with all valid fields', async () => {
            dto.email = 'user@example.com';
            dto.password = 'SecurePassword123!';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with multiple invalid fields', async () => {
            dto.email = 'invalid-email';
            dto.password = '';

            const errors = await validate(dto);
            expect(errors).toHaveLength(2);
            expect(errors.some(error => error.property === 'email')).toBe(true);
            expect(errors.some(error => error.property === 'password')).toBe(true);
        });
    });
});
