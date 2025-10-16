import { User } from './user.entity';
import { RoleEnum } from '../../@common/enums/role.enum';
import { plainToClass, classToPlain } from 'class-transformer';

describe('User Entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
    });

    describe('Entity Structure', () => {
        it('should be defined', () => {
            expect(User).toBeDefined();
        });

        it('should be instantiable', () => {
            expect(user).toBeInstanceOf(User);
        });

        it('should have all required properties', () => {
            const userProperties = [
                'id',
                'email',
                'password',
                'role',
                'applications',
                'createdAt',
                'updatedAt',
                'deletedAt'
            ];

            // Set some properties to test
            user.id = 1;
            user.email = 'test@example.com';
            user.password = 'hashedPassword';
            user.role = RoleEnum.User;
            user.applications = [];
            user.createdAt = new Date();
            user.updatedAt = new Date();
            user.deletedAt = null;

            userProperties.forEach(property => {
                expect(user).toHaveProperty(property);
            });
        });
    });

    describe('Property Types and Defaults', () => {
        it('should have correct property types', () => {
            user.id = 1;
            user.email = 'test@example.com';
            user.password = 'hashedPassword';
            user.role = RoleEnum.User;
            user.applications = [];
            user.createdAt = new Date();
            user.updatedAt = new Date();
            user.deletedAt = null;

            expect(typeof user.id).toBe('number');
            expect(typeof user.email).toBe('string');
            expect(typeof user.password).toBe('string');
            expect(typeof user.role).toBe('string');
            expect(Array.isArray(user.applications)).toBe(true);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.deletedAt).toBeNull();
        });

        it('should accept valid role enum values', () => {
            user.role = RoleEnum.User;
            expect(user.role).toBe(RoleEnum.User);

            user.role = RoleEnum.Admin;
            expect(user.role).toBe(RoleEnum.Admin);
        });
    });

    describe('Class Transformer Integration', () => {
        it('should exclude password when transforming to plain object', () => {
            user.id = 1;
            user.email = 'test@example.com';
            user.password = 'secretPassword';
            user.role = RoleEnum.User;
            user.applications = [];
            user.createdAt = new Date();
            user.updatedAt = new Date();

            const plainObject = classToPlain(user);

            expect(plainObject).not.toHaveProperty('password');
            expect(plainObject).toHaveProperty('id', 1);
            expect(plainObject).toHaveProperty('email', 'test@example.com');
            expect(plainObject).toHaveProperty('role', RoleEnum.User);
        });

        it('should transform from plain object correctly', () => {
            const plainData = {
                id: 1,
                email: 'test@example.com',
                password: 'secretPassword',
                role: RoleEnum.User,
                applications: [] as any[],
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null as Date | null
            };

            const transformedUser = plainToClass(User, plainData);

            expect(transformedUser).toBeInstanceOf(User);
            expect(transformedUser.id).toBe(1);
            expect(transformedUser.email).toBe('test@example.com');
            // Note: password is excluded by @Exclude() decorator, so it won't be transformed
            expect(transformedUser.role).toBe(RoleEnum.User);
        });

        it('should handle partial data transformation', () => {
            const partialData = {
                email: 'test@example.com',
                role: RoleEnum.Admin,
                applications: [] as any[],
                deletedAt: null as Date | null
            };

            const transformedUser = plainToClass(User, partialData);

            expect(transformedUser).toBeInstanceOf(User);
            expect(transformedUser.email).toBe('test@example.com');
            expect(transformedUser.role).toBe(RoleEnum.Admin);
            expect(transformedUser.id).toBeUndefined();
        });
    });

    describe('Soft Delete Functionality', () => {
        it('should handle soft delete with deletedAt property', () => {
            const deleteDate = new Date();
            user.deletedAt = deleteDate;

            expect(user.deletedAt).toBe(deleteDate);
        });

        it('should handle restoration by setting deletedAt to null', () => {
            user.deletedAt = new Date();
            user.deletedAt = null;

            expect(user.deletedAt).toBeNull();
        });
    });

    describe('Timestamps', () => {
        it('should handle createdAt timestamp', () => {
            const createDate = new Date('2024-01-01T00:00:00Z');
            user.createdAt = createDate;

            expect(user.createdAt).toBe(createDate);
        });

        it('should handle updatedAt timestamp', () => {
            const updateDate = new Date('2024-01-02T00:00:00Z');
            user.updatedAt = updateDate;

            expect(user.updatedAt).toBe(updateDate);
        });

        it('should allow different timestamps for created and updated', () => {
            const createDate = new Date('2024-01-01T00:00:00Z');
            const updateDate = new Date('2024-01-02T00:00:00Z');

            user.createdAt = createDate;
            user.updatedAt = updateDate;

            expect(user.createdAt).not.toEqual(user.updatedAt);
            expect(user.updatedAt.getTime()).toBeGreaterThan(user.createdAt.getTime());
        });
    });

    describe('Email Validation', () => {
        it('should accept valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                '123@test.com'
            ];

            validEmails.forEach(email => {
                user.email = email;
                expect(user.email).toBe(email);
            });
        });

        it('should handle email case sensitivity', () => {
            user.email = 'Test@Example.COM';
            expect(user.email).toBe('Test@Example.COM');
        });
    });

    describe('Applications Relationship', () => {
        it('should handle empty applications array', () => {
            user.applications = [];
            expect(user.applications).toEqual([]);
            expect(Array.isArray(user.applications)).toBe(true);
        });

        it('should handle applications array with mock data', () => {
            const mockApplications = [
                { id: 1, name: 'App 1' },
                { id: 2, name: 'App 2' }
            ] as any;

            user.applications = mockApplications;
            expect(user.applications).toEqual(mockApplications);
            expect(user.applications).toHaveLength(2);
        });
    });

    describe('Entity Immutability', () => {
        it('should allow property modification', () => {
            user.id = 1;
            user.email = 'original@example.com';

            user.email = 'modified@example.com';

            expect(user.id).toBe(1);
            expect(user.email).toBe('modified@example.com');
        });
    });

    describe('JSON Serialization', () => {
        it('should serialize to JSON correctly', () => {
            user.id = 1;
            user.email = 'test@example.com';
            user.role = RoleEnum.User;
            user.applications = [];
            user.createdAt = new Date('2024-01-01T00:00:00Z');
            user.updatedAt = new Date('2024-01-01T00:00:00Z');
            user.deletedAt = null;

            const json = JSON.stringify(user);
            const parsed = JSON.parse(json);

            expect(parsed.id).toBe(1);
            expect(parsed.email).toBe('test@example.com');
            expect(parsed.role).toBe(RoleEnum.User);
            expect(parsed.applications).toEqual([]);
        });
    });
});
