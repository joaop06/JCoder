import { SignInResponseDto } from './sign-in-response.dto';
import { User } from '../../users/entities/user.entity';
import { RoleEnum } from '../../@common/enums/role.enum';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('SignInResponseDto', () => {
    it('should be defined', () => {
        const dto = new SignInResponseDto();
        expect(dto).toBeDefined();
    });

    describe('Validation', () => {
        const createMockUser = (): User => {
            const user = new User();
            user.id = 1;
            user.email = 'test@example.com';
            user.password = 'hashedPassword';
            user.role = RoleEnum.User;
            user.createdAt = new Date('2023-01-01T00:00:00.000Z');
            user.updatedAt = new Date('2023-01-01T00:00:00.000Z');
            user.deletedAt = null;
            user.applications = [];
            return user;
        };

        it('should pass validation with valid data', async () => {
            const validData = {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
                user: createMockUser(),
            };

            const dto = plainToInstance(SignInResponseDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.accessToken).toBe(validData.accessToken);
            expect(dto.user).toBeDefined();
            expect(dto.user.id).toBe(validData.user.id);
            expect(dto.user.email).toBe(validData.user.email);
        });

        it('should fail validation when accessToken is missing', async () => {
            const invalidData = {
                user: createMockUser(),
            };

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('accessToken');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when user is missing', async () => {
            const invalidData = {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
            };

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('user');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when accessToken is empty string', async () => {
            const invalidData = {
                accessToken: '',
                user: createMockUser(),
            };

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('accessToken');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when accessToken is not a string', async () => {
            const invalidData = {
                accessToken: 123,
                user: createMockUser(),
            };

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('accessToken');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when accessToken is null', async () => {
            const invalidData = {
                accessToken: null,
                user: createMockUser(),
            };

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(1);
            expect(errors[0].property).toBe('accessToken');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when both accessToken and user are missing', async () => {
            const invalidData = {};

            const dto = plainToInstance(SignInResponseDto, invalidData);
            const errors = await validate(dto);

            expect(errors.length).toBe(2);
            expect(errors.some(error => error.property === 'accessToken')).toBe(true);
            expect(errors.some(error => error.property === 'user')).toBe(true);
        });

        it('should pass validation with different user roles', async () => {
            const userRoles = [RoleEnum.User, RoleEnum.Admin];

            for (const role of userRoles) {
                const user = createMockUser();
                user.role = role;

                const validData = {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
                    user,
                };

                const dto = plainToInstance(SignInResponseDto, validData);
                const errors = await validate(dto);

                expect(errors.length).toBe(0);
                expect(dto.user.role).toBe(role);
            }
        });

        it('should pass validation with user having applications', async () => {
            const user = createMockUser();
            user.applications = [
                { id: 1, name: 'App 1' } as any,
                { id: 2, name: 'App 2' } as any,
            ];

            const validData = {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
                user,
            };

            const dto = plainToInstance(SignInResponseDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.user.applications).toHaveLength(2);
        });

        it('should pass validation with user having deletedAt set', async () => {
            const user = createMockUser();
            user.deletedAt = new Date('2023-12-31T23:59:59.999Z');

            const validData = {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
                user,
            };

            const dto = plainToInstance(SignInResponseDto, validData);
            const errors = await validate(dto);

            expect(errors.length).toBe(0);
            expect(dto.user.deletedAt).toBeDefined();
        });
    });

    describe('Property Assignment', () => {
        it('should correctly assign accessToken property', () => {
            const dto = new SignInResponseDto();
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U';

            dto.accessToken = accessToken;

            expect(dto.accessToken).toBe(accessToken);
        });

        it('should correctly assign user property', () => {
            const dto = new SignInResponseDto();
            const user = new User();
            user.id = 1;
            user.email = 'test@example.com';
            user.role = RoleEnum.Admin;

            dto.user = user;

            expect(dto.user).toBe(user);
            expect(dto.user.id).toBe(1);
            expect(dto.user.email).toBe('test@example.com');
            expect(dto.user.role).toBe(RoleEnum.Admin);
        });

        it('should handle different access token formats', () => {
            const dto = new SignInResponseDto();
            const tokens = [
                'simple.token.here',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            ];

            for (const token of tokens) {
                dto.accessToken = token;
                expect(dto.accessToken).toBe(token);
            }
        });

        it('should handle user with all properties set', () => {
            const dto = new SignInResponseDto();
            const user = new User();
            user.id = 42;
            user.email = 'admin@company.com';
            user.password = 'hashedPassword123';
            user.role = RoleEnum.Admin;
            user.createdAt = new Date('2023-01-01T00:00:00.000Z');
            user.updatedAt = new Date('2023-12-31T23:59:59.999Z');
            user.deletedAt = null;
            user.applications = [];

            dto.user = user;

            expect(dto.user.id).toBe(42);
            expect(dto.user.email).toBe('admin@company.com');
            expect(dto.user.password).toBe('hashedPassword123');
            expect(dto.user.role).toBe(RoleEnum.Admin);
            expect(dto.user.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
            expect(dto.user.updatedAt).toEqual(new Date('2023-12-31T23:59:59.999Z'));
            expect(dto.user.deletedAt).toBeNull();
            expect(dto.user.applications).toEqual([]);
        });
    });

    describe('Class Transformation', () => {
        it('should transform plain object to SignInResponseDto instance', () => {
            const plainObject = {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
                user: {
                    id: 1,
                    email: 'test@example.com',
                    role: RoleEnum.User,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                    deletedAt: null,
                    applications: [],
                },
            };

            const dto = plainToInstance(SignInResponseDto, plainObject);

            expect(dto).toBeInstanceOf(SignInResponseDto);
            expect(dto.accessToken).toBe(plainObject.accessToken);
            expect(dto.user).toBeDefined();
            expect(dto.user.id).toBe(plainObject.user.id);
            expect(dto.user.email).toBe(plainObject.user.email);
            expect(dto.user.role).toBe(plainObject.user.role);
        });
    });
});
