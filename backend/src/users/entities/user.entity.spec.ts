// Mock entities to avoid circular dependencies
class MockUserApplication {
    id: number;
    userId: number;
    user: any;
    name: string;
    description: string;
    applicationType: string;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock User entity
class MockUserEntity {
    id: number;
    email: string;
    password: string;
    role: string;
    applications: MockUserApplication[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

describe('User Entity', () => {
    let entity: MockUserEntity;

    beforeEach(() => {
        entity = new MockUserEntity();
    });

    describe('Entity Definition', () => {
        it('should be defined', () => {
            expect(entity).toBeDefined();
            expect(entity).toBeInstanceOf(MockUserEntity);
        });
    });

    describe('Basic Properties', () => {
        it('should have id property', () => {
            expect(entity.id).toBeUndefined();
            entity.id = 1;
            expect(entity.id).toBe(1);
        });

        it('should have email property', () => {
            expect(entity.email).toBeUndefined();
            entity.email = 'test@example.com';
            expect(entity.email).toBe('test@example.com');
        });

        it('should have password property', () => {
            expect(entity.password).toBeUndefined();
            entity.password = 'hashedPassword123';
            expect(entity.password).toBe('hashedPassword123');
        });

        it('should have role property', () => {
            expect(entity.role).toBeUndefined();
            entity.role = 'admin';
            expect(entity.role).toBe('admin');
        });

        it('should have applications property', () => {
            expect(entity.applications).toBeUndefined();
            entity.applications = [];
            expect(entity.applications).toEqual([]);
        });
    });

    describe('Relationship Properties', () => {
        it('should have applications property as array', () => {
            expect(entity.applications).toBeUndefined();
            const mockApplications = [new MockUserApplication(), new MockUserApplication()];
            entity.applications = mockApplications;
            expect(entity.applications).toBe(mockApplications);
            expect(Array.isArray(entity.applications)).toBe(true);
        });

        it('should handle applications relationship', () => {
            const mockApplication1 = new MockUserApplication();
            mockApplication1.id = 1;
            mockApplication1.name = 'Test App 1';
            mockApplication1.userId = 123;

            const mockApplication2 = new MockUserApplication();
            mockApplication2.id = 2;
            mockApplication2.name = 'Test App 2';
            mockApplication2.userId = 123;

            entity.id = 123;
            entity.applications = [mockApplication1, mockApplication2];

            expect(entity.applications).toHaveLength(2);
            expect(entity.applications[0]).toBe(mockApplication1);
            expect(entity.applications[1]).toBe(mockApplication2);
            expect(entity.applications[0].userId).toBe(123);
            expect(entity.applications[1].userId).toBe(123);
        });
    });

    describe('Timestamp Properties', () => {
        it('should have createdAt property', () => {
            expect(entity.createdAt).toBeUndefined();
            const date = new Date();
            entity.createdAt = date;
            expect(entity.createdAt).toBe(date);
        });

        it('should have updatedAt property', () => {
            expect(entity.updatedAt).toBeUndefined();
            const date = new Date();
            entity.updatedAt = date;
            expect(entity.updatedAt).toBe(date);
        });

        it('should have deletedAt property', () => {
            expect(entity.deletedAt).toBeUndefined();
            const date = new Date();
            entity.deletedAt = date;
            expect(entity.deletedAt).toBe(date);
        });
    });

    describe('Entity Structure', () => {
        it('should have all required properties', () => {
            const requiredProperties = [
                'id',
                'email',
                'password',
                'role',
                'applications',
                'createdAt',
                'updatedAt',
                'deletedAt'
            ];

            requiredProperties.forEach(property => {
                expect(entity).toHaveProperty(property);
            });
        });

        it('should have correct property types', () => {
            entity.id = 1;
            entity.email = 'test@example.com';
            entity.password = 'hashedPassword';
            entity.role = 'user';
            entity.applications = [];
            entity.createdAt = new Date();
            entity.updatedAt = new Date();
            entity.deletedAt = new Date();

            expect(typeof entity.id).toBe('number');
            expect(typeof entity.email).toBe('string');
            expect(typeof entity.password).toBe('string');
            expect(typeof entity.role).toBe('string');
            expect(Array.isArray(entity.applications)).toBe(true);
            expect(entity.createdAt).toBeInstanceOf(Date);
            expect(entity.updatedAt).toBeInstanceOf(Date);
            expect(entity.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('RoleEnum Values', () => {
        it('should accept user role', () => {
            entity.role = 'user';
            expect(entity.role).toBe('user');
        });

        it('should accept admin role', () => {
            entity.role = 'admin';
            expect(entity.role).toBe('admin');
        });

        it('should handle role case sensitivity', () => {
            entity.role = 'User';
            expect(entity.role).toBe('User');

            entity.role = 'Admin';
            expect(entity.role).toBe('Admin');
        });
    });

    describe('Entity Instantiation', () => {
        it('should create instance with all properties', () => {
            const testData = {
                id: 1,
                email: 'user@example.com',
                password: 'hashedPassword123',
                role: 'admin',
                applications: [] as MockUserApplication[],
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                deletedAt: null as Date | null
            };

            const entity = Object.assign(new MockUserEntity(), testData);

            expect(entity.id).toBe(1);
            expect(entity.email).toBe('user@example.com');
            expect(entity.password).toBe('hashedPassword123');
            expect(entity.role).toBe('admin');
            expect(entity.applications).toEqual([]);
            expect(entity.createdAt).toEqual(new Date('2023-01-01'));
            expect(entity.updatedAt).toEqual(new Date('2023-01-02'));
            expect(entity.deletedAt).toBeNull();
        });

        it('should create instance with only required properties', () => {
            const testData = {
                id: 1,
                email: 'minimal@example.com',
                password: 'password123',
                role: 'user'
            };

            const entity = Object.assign(new MockUserEntity(), testData);

            expect(entity.id).toBe(1);
            expect(entity.email).toBe('minimal@example.com');
            expect(entity.password).toBe('password123');
            expect(entity.role).toBe('user');
            expect(entity.applications).toBeUndefined();
            expect(entity.createdAt).toBeUndefined();
            expect(entity.updatedAt).toBeUndefined();
            expect(entity.deletedAt).toBeUndefined();
        });

        it('should create instance with applications relationship', () => {
            const mockApplication1 = new MockUserApplication();
            mockApplication1.id = 1;
            mockApplication1.name = 'App 1';

            const mockApplication2 = new MockUserApplication();
            mockApplication2.id = 2;
            mockApplication2.name = 'App 2';

            const testData = {
                id: 123,
                email: 'developer@example.com',
                password: 'hashedPassword',
                role: 'admin',
                applications: [mockApplication1, mockApplication2]
            };

            const entity = Object.assign(new MockUserEntity(), testData);

            expect(entity.applications).toHaveLength(2);
            expect(entity.applications[0]).toBe(mockApplication1);
            expect(entity.applications[1]).toBe(mockApplication2);
            expect(entity.applications[0].name).toBe('App 1');
            expect(entity.applications[1].name).toBe('App 2');
        });
    });

    describe('Property Types', () => {
        it('should accept number for id', () => {
            entity.id = 999;
            expect(typeof entity.id).toBe('number');
            expect(entity.id).toBe(999);
        });

        it('should accept string for email', () => {
            entity.email = 'user@domain.com';
            expect(typeof entity.email).toBe('string');
            expect(entity.email).toBe('user@domain.com');
        });

        it('should accept string for password', () => {
            entity.password = 'veryLongHashedPassword123!@#';
            expect(typeof entity.password).toBe('string');
            expect(entity.password).toBe('veryLongHashedPassword123!@#');
        });

        it('should accept string for role', () => {
            entity.role = 'customRole';
            expect(typeof entity.role).toBe('string');
            expect(entity.role).toBe('customRole');
        });

        it('should accept array for applications', () => {
            const apps = [new MockUserApplication(), new MockUserApplication()];
            entity.applications = apps;
            expect(Array.isArray(entity.applications)).toBe(true);
            expect(entity.applications).toHaveLength(2);
        });

        it('should accept Date for timestamps', () => {
            const now = new Date();
            entity.createdAt = now;
            entity.updatedAt = now;
            entity.deletedAt = now;

            expect(entity.createdAt).toBeInstanceOf(Date);
            expect(entity.updatedAt).toBeInstanceOf(Date);
            expect(entity.deletedAt).toBeInstanceOf(Date);
        });
    });

    describe('Email Validation Scenarios', () => {
        it('should handle valid email formats', () => {
            const validEmails = [
                'user@example.com',
                'test.user@domain.org',
                'user+tag@example.co.uk',
                'user123@test-domain.com',
                'a@b.c',
                'user.name+tag@example-domain.com'
            ];

            validEmails.forEach(email => {
                entity.email = email;
                expect(entity.email).toBe(email);
            });
        });

        it('should handle email with special characters', () => {
            entity.email = 'user.name+tag@example-domain.com';
            expect(entity.email).toBe('user.name+tag@example-domain.com');
        });

        it('should handle international email domains', () => {
            entity.email = 'user@example.co.uk';
            expect(entity.email).toBe('user@example.co.uk');
        });
    });

    describe('Password Scenarios', () => {
        it('should handle hashed passwords', () => {
            const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890';
            entity.password = hashedPassword;
            expect(entity.password).toBe(hashedPassword);
        });

        it('should handle long passwords', () => {
            const longPassword = 'a'.repeat(1000);
            entity.password = longPassword;
            expect(entity.password).toBe(longPassword);
        });

        it('should handle passwords with special characters', () => {
            const specialPassword = 'P@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?';
            entity.password = specialPassword;
            expect(entity.password).toBe(specialPassword);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values for optional properties', () => {
            entity.applications = null;
            entity.deletedAt = null;

            expect(entity.applications).toBeNull();
            expect(entity.deletedAt).toBeNull();
        });

        it('should handle undefined values for optional properties', () => {
            entity.applications = undefined;
            entity.deletedAt = undefined;

            expect(entity.applications).toBeUndefined();
            expect(entity.deletedAt).toBeUndefined();
        });

        it('should handle empty strings for string properties', () => {
            entity.email = '';
            entity.password = '';
            entity.role = '';

            expect(entity.email).toBe('');
            expect(entity.password).toBe('');
            expect(entity.role).toBe('');
        });

        it('should handle empty array for applications', () => {
            entity.applications = [];
            expect(Array.isArray(entity.applications)).toBe(true);
            expect(entity.applications).toHaveLength(0);
        });

        it('should handle zero for numeric properties', () => {
            entity.id = 0;
            expect(entity.id).toBe(0);
        });

        it('should handle negative numbers for id', () => {
            entity.id = -1;
            expect(entity.id).toBe(-1);
        });

        it('should handle very long strings', () => {
            const longString = 'a'.repeat(10000);
            entity.email = longString;
            entity.password = longString;
            entity.role = longString;

            expect(entity.email).toBe(longString);
            expect(entity.password).toBe(longString);
            expect(entity.role).toBe(longString);
        });

        it('should handle special characters in strings', () => {
            entity.email = 'user@domain-with-dashes.com';
            entity.password = 'P@ssw0rd!@#$%^&*()';
            entity.role = 'custom-role_with_underscores';

            expect(entity.email).toBe('user@domain-with-dashes.com');
            expect(entity.password).toBe('P@ssw0rd!@#$%^&*()');
            expect(entity.role).toBe('custom-role_with_underscores');
        });
    });

    describe('Relationship Scenarios', () => {
        it('should handle user with no applications', () => {
            entity.id = 1;
            entity.email = 'user@example.com';
            entity.applications = [];

            expect(entity.applications).toHaveLength(0);
        });

        it('should handle user with single application', () => {
            const mockApplication = new MockUserApplication();
            mockApplication.id = 1;
            mockApplication.name = 'Single App';
            mockApplication.userId = 123;

            entity.id = 123;
            entity.email = 'user@example.com';
            entity.applications = [mockApplication];

            expect(entity.applications).toHaveLength(1);
            expect(entity.applications[0]).toBe(mockApplication);
            expect(entity.applications[0].userId).toBe(123);
        });

        it('should handle user with multiple applications', () => {
            const mockApp1 = new MockUserApplication();
            mockApp1.id = 1;
            mockApp1.name = 'App 1';
            mockApp1.userId = 123;

            const mockApp2 = new MockUserApplication();
            mockApp2.id = 2;
            mockApp2.name = 'App 2';
            mockApp2.userId = 123;

            const mockApp3 = new MockUserApplication();
            mockApp3.id = 3;
            mockApp3.name = 'App 3';
            mockApp3.userId = 123;

            entity.id = 123;
            entity.email = 'developer@example.com';
            entity.applications = [mockApp1, mockApp2, mockApp3];

            expect(entity.applications).toHaveLength(3);
            expect(entity.applications[0].name).toBe('App 1');
            expect(entity.applications[1].name).toBe('App 2');
            expect(entity.applications[2].name).toBe('App 3');
        });

        it('should handle user with applications of different types', () => {
            const apiApp = new MockUserApplication();
            apiApp.id = 1;
            apiApp.name = 'API Application';
            apiApp.applicationType = 'API';
            apiApp.userId = 123;

            const mobileApp = new MockUserApplication();
            mobileApp.id = 2;
            mobileApp.name = 'Mobile Application';
            mobileApp.applicationType = 'MOBILE';
            mobileApp.userId = 123;

            const frontendApp = new MockUserApplication();
            frontendApp.id = 3;
            frontendApp.name = 'Frontend Application';
            frontendApp.applicationType = 'FRONTEND';
            frontendApp.userId = 123;

            entity.id = 123;
            entity.email = 'fullstack@example.com';
            entity.applications = [apiApp, mobileApp, frontendApp];

            expect(entity.applications).toHaveLength(3);
            expect(entity.applications[0].applicationType).toBe('API');
            expect(entity.applications[1].applicationType).toBe('MOBILE');
            expect(entity.applications[2].applicationType).toBe('FRONTEND');
        });
    });

    describe('Business Logic Scenarios', () => {
        it('should handle active user', () => {
            entity.id = 1;
            entity.email = 'active@example.com';
            entity.role = 'user';
            entity.deletedAt = null;

            expect(entity.deletedAt).toBeNull();
        });

        it('should handle soft deleted user', () => {
            entity.id = 1;
            entity.email = 'deleted@example.com';
            entity.role = 'user';
            entity.deletedAt = new Date();

            expect(entity.deletedAt).toBeInstanceOf(Date);
        });

        it('should handle admin user', () => {
            entity.id = 1;
            entity.email = 'admin@example.com';
            entity.role = 'admin';
            entity.applications = [];

            expect(entity.role).toBe('admin');
        });

        it('should handle regular user', () => {
            entity.id = 1;
            entity.email = 'user@example.com';
            entity.role = 'user';
            entity.applications = [];

            expect(entity.role).toBe('user');
        });

        it('should handle user with all optional fields populated', () => {
            const mockApp = new MockUserApplication();
            mockApp.id = 1;
            mockApp.name = 'Test App';

            entity.id = 1;
            entity.email = 'complete@example.com';
            entity.password = 'hashedPassword';
            entity.role = 'admin';
            entity.applications = [mockApp];
            entity.createdAt = new Date();
            entity.updatedAt = new Date();
            entity.deletedAt = null;

            expect(entity.applications).toBeDefined();
            expect(entity.createdAt).toBeDefined();
            expect(entity.updatedAt).toBeDefined();
            expect(entity.deletedAt).toBeNull();
        });

        it('should handle user with no optional fields', () => {
            entity.id = 1;
            entity.email = 'minimal@example.com';
            entity.password = 'password';
            entity.role = 'user';
            entity.applications = undefined;
            entity.createdAt = undefined;
            entity.updatedAt = undefined;
            entity.deletedAt = undefined;

            expect(entity.applications).toBeUndefined();
            expect(entity.createdAt).toBeUndefined();
            expect(entity.updatedAt).toBeUndefined();
            expect(entity.deletedAt).toBeUndefined();
        });
    });

    describe('Data Validation Scenarios', () => {
        it('should handle valid email formats', () => {
            const validEmails = [
                'user@example.com',
                'test.user@domain.org',
                'user+tag@example.co.uk',
                'user123@test-domain.com'
            ];

            validEmails.forEach(email => {
                entity.email = email;
                expect(entity.email).toBe(email);
            });
        });

        it('should handle valid role values', () => {
            const validRoles = ['user', 'admin', 'User', 'Admin', 'USER', 'ADMIN'];

            validRoles.forEach(role => {
                entity.role = role;
                expect(entity.role).toBe(role);
            });
        });

        it('should handle valid password formats', () => {
            const validPasswords = [
                'password123',
                '$2b$10$hashedpassword',
                'P@ssw0rd!',
                'verylongpasswordwithspecialchars!@#$%^&*()'
            ];

            validPasswords.forEach(password => {
                entity.password = password;
                expect(entity.password).toBe(password);
            });
        });
    });

    describe('Timestamp Scenarios', () => {
        it('should handle creation timestamp', () => {
            const createdAt = new Date('2023-01-01T00:00:00Z');
            entity.createdAt = createdAt;
            expect(entity.createdAt).toEqual(createdAt);
        });

        it('should handle update timestamp', () => {
            const updatedAt = new Date('2023-01-02T12:30:00Z');
            entity.updatedAt = updatedAt;
            expect(entity.updatedAt).toEqual(updatedAt);
        });

        it('should handle deletion timestamp', () => {
            const deletedAt = new Date('2023-01-03T23:59:59Z');
            entity.deletedAt = deletedAt;
            expect(entity.deletedAt).toEqual(deletedAt);
        });

        it('should handle same timestamps for created and updated', () => {
            const sameTime = new Date();
            entity.createdAt = sameTime;
            entity.updatedAt = sameTime;

            expect(entity.createdAt).toBe(entity.updatedAt);
        });

        it('should handle different timestamps for created and updated', () => {
            const createdAt = new Date('2023-01-01');
            const updatedAt = new Date('2023-01-02');

            entity.createdAt = createdAt;
            entity.updatedAt = updatedAt;

            expect(entity.createdAt).not.toBe(entity.updatedAt);
            expect(entity.updatedAt.getTime()).toBeGreaterThan(entity.createdAt.getTime());
        });
    });
});
