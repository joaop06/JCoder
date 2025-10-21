import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

// Mock User entity
interface MockUser {
    id: number;
    email: string;
    password: string;
    role: RoleEnum;
    applications?: any[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

describe('UsersService Integration', () => {
    let service: UsersService;
    let repository: jest.Mocked<Repository<User>>;

    const fixedDate = new Date('2023-01-01T00:00:00.000Z');

    const mockUser: MockUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: RoleEnum.Admin,
        applications: [],
        createdAt: fixedDate,
        updatedAt: fixedDate,
    };

    const mockUser2: MockUser = {
        id: 2,
        email: 'user@example.com',
        password: '$2b$10$hashedpassword2',
        role: RoleEnum.User,
        applications: [],
        createdAt: fixedDate,
        updatedAt: fixedDate,
    };

    beforeEach(async () => {
        // Create mock repository
        const mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return user by id when user exists', async () => {
            const userId = 1;
            repository.findOneBy.mockResolvedValue(mockUser as any);

            const result = await service.findById(userId);

            expect(result).toEqual(mockUser);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
            expect(repository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should return user by id for different user roles', async () => {
            const userId = 2;
            repository.findOneBy.mockResolvedValue(mockUser2 as any);

            const result = await service.findById(userId);

            expect(result).toEqual(mockUser2);
            expect(result.role).toBe(RoleEnum.User);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            const userId = 999;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(userId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });

        it('should throw UserNotFoundException when user is soft deleted', async () => {
            const userId = 1;
            const deletedUser = { ...mockUser, deletedAt: new Date() };
            repository.findOneBy.mockResolvedValue(null); // TypeORM with soft delete returns null

            await expect(service.findById(userId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });

        it('should handle repository errors gracefully', async () => {
            const userId = 1;
            const error = new Error('Database connection failed');
            repository.findOneBy.mockRejectedValue(error);

            await expect(service.findById(userId)).rejects.toThrow('Database connection failed');
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });

        it('should handle invalid id types', async () => {
            const invalidId = 'invalid' as any;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(invalidId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: invalidId });
        });

        it('should handle zero id', async () => {
            const zeroId = 0;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(zeroId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: zeroId });
        });

        it('should handle negative id', async () => {
            const negativeId = -1;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(negativeId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: negativeId });
        });

        it('should return user with all properties', async () => {
            const userId = 1;
            repository.findOneBy.mockResolvedValue(mockUser as any);

            const result = await service.findById(userId);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('password');
            expect(result).toHaveProperty('role');
            expect(result).toHaveProperty('applications');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
            expect(result.id).toBe(1);
            expect(result.email).toBe('test@example.com');
            expect(result.role).toBe(RoleEnum.Admin);
        });

        it('should handle concurrent findById calls', async () => {
            const userIds = [1, 2, 3];
            const mockUsers = [mockUser, mockUser2, { ...mockUser, id: 3, email: 'user3@example.com' }];

            repository.findOneBy
                .mockResolvedValueOnce(mockUsers[0] as any)
                .mockResolvedValueOnce(mockUsers[1] as any)
                .mockResolvedValueOnce(mockUsers[2] as any);

            const promises = userIds.map(id => service.findById(id));
            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(results[0].id).toBe(1);
            expect(results[1].id).toBe(2);
            expect(results[2].id).toBe(3);
            expect(repository.findOneBy).toHaveBeenCalledTimes(3);
        });
    });

    describe('findByEmail', () => {
        it('should return user by email when user exists', async () => {
            const userEmail = 'test@example.com';
            repository.findOneBy.mockResolvedValue(mockUser as any);

            const result = await service.findByEmail(userEmail);

            expect(result).toEqual(mockUser);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
            expect(repository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should return user by email for different user roles', async () => {
            const userEmail = 'user@example.com';
            repository.findOneBy.mockResolvedValue(mockUser2 as any);

            const result = await service.findByEmail(userEmail);

            expect(result).toEqual(mockUser2);
            expect(result.role).toBe(RoleEnum.User);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            const userEmail = 'nonexistent@example.com';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should throw UserNotFoundException when user is soft deleted', async () => {
            const userEmail = 'test@example.com';
            repository.findOneBy.mockResolvedValue(null); // TypeORM with soft delete returns null

            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle repository errors gracefully', async () => {
            const userEmail = 'test@example.com';
            const error = new Error('Database connection failed');
            repository.findOneBy.mockRejectedValue(error);

            await expect(service.findByEmail(userEmail)).rejects.toThrow('Database connection failed');
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle empty email string', async () => {
            const emptyEmail = '';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(emptyEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: emptyEmail });
        });

        it('should handle null email', async () => {
            const nullEmail = null as any;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(nullEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: nullEmail });
        });

        it('should handle undefined email', async () => {
            const undefinedEmail = undefined as any;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(undefinedEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: undefinedEmail });
        });

        it('should handle case-sensitive email matching', async () => {
            const userEmail = 'Test@Example.com'; // Different case
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle email with special characters', async () => {
            const specialEmail = 'test+tag@example-domain.co.uk';
            const specialUser = { ...mockUser, email: specialEmail };
            repository.findOneBy.mockResolvedValue(specialUser as any);

            const result = await service.findByEmail(specialEmail);

            expect(result).toEqual(specialUser);
            expect(result.email).toBe(specialEmail);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: specialEmail });
        });

        it('should return user with all properties', async () => {
            const userEmail = 'test@example.com';
            repository.findOneBy.mockResolvedValue(mockUser as any);

            const result = await service.findByEmail(userEmail);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('password');
            expect(result).toHaveProperty('role');
            expect(result).toHaveProperty('applications');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
            expect(result.id).toBe(1);
            expect(result.email).toBe('test@example.com');
            expect(result.role).toBe(RoleEnum.Admin);
        });

        it('should handle concurrent findByEmail calls', async () => {
            const userEmails = ['test@example.com', 'user@example.com', 'admin@example.com'];
            const mockUsers = [
                mockUser,
                mockUser2,
                { ...mockUser, id: 3, email: 'admin@example.com', role: RoleEnum.Admin }
            ];

            repository.findOneBy
                .mockResolvedValueOnce(mockUsers[0] as any)
                .mockResolvedValueOnce(mockUsers[1] as any)
                .mockResolvedValueOnce(mockUsers[2] as any);

            const promises = userEmails.map(email => service.findByEmail(email));
            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(results[0].email).toBe('test@example.com');
            expect(results[1].email).toBe('user@example.com');
            expect(results[2].email).toBe('admin@example.com');
            expect(repository.findOneBy).toHaveBeenCalledTimes(3);
        });

        it('should handle very long email addresses', async () => {
            const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(longEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: longEmail });
        });
    });

    describe('Service Integration', () => {
        it('should have correct service dependencies', () => {
            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(UsersService);
        });

        it('should have repository injected correctly', () => {
            expect(repository).toBeDefined();
            expect(repository.findOneBy).toBeDefined();
        });

        it('should handle mixed findById and findByEmail calls', async () => {
            repository.findOneBy
                .mockResolvedValueOnce(mockUser as any) // findById call
                .mockResolvedValueOnce(mockUser2 as any); // findByEmail call

            const [userById, userByEmail] = await Promise.all([
                service.findById(1),
                service.findByEmail('user@example.com')
            ]);

            expect(userById.id).toBe(1);
            expect(userByEmail.email).toBe('user@example.com');
            expect(repository.findOneBy).toHaveBeenCalledTimes(2);
            expect(repository.findOneBy).toHaveBeenNthCalledWith(1, { id: 1 });
            expect(repository.findOneBy).toHaveBeenNthCalledWith(2, { email: 'user@example.com' });
        });
    });

    describe('Error Handling', () => {
        it('should handle database timeout errors', async () => {
            const timeoutError = new Error('Query timeout');
            repository.findOneBy.mockRejectedValue(timeoutError);

            await expect(service.findById(1)).rejects.toThrow('Query timeout');
            await expect(service.findByEmail('test@example.com')).rejects.toThrow('Query timeout');
        });

        it('should handle database connection errors', async () => {
            const connectionError = new Error('Connection lost');
            repository.findOneBy.mockRejectedValue(connectionError);

            await expect(service.findById(1)).rejects.toThrow('Connection lost');
            await expect(service.findByEmail('test@example.com')).rejects.toThrow('Connection lost');
        });

        it('should handle constraint violation errors', async () => {
            const constraintError = new Error('UNIQUE constraint failed');
            repository.findOneBy.mockRejectedValue(constraintError);

            await expect(service.findById(1)).rejects.toThrow('UNIQUE constraint failed');
            await expect(service.findByEmail('test@example.com')).rejects.toThrow('UNIQUE constraint failed');
        });

        it('should handle malformed data errors', async () => {
            const malformedError = new Error('Invalid data format');
            repository.findOneBy.mockRejectedValue(malformedError);

            await expect(service.findById(1)).rejects.toThrow('Invalid data format');
            await expect(service.findByEmail('test@example.com')).rejects.toThrow('Invalid data format');
        });
    });

    describe('Data Validation', () => {
        it('should handle user with missing optional properties', async () => {
            const minimalUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedpassword',
                role: RoleEnum.User,
                createdAt: fixedDate,
                updatedAt: fixedDate,
            };
            repository.findOneBy.mockResolvedValue(minimalUser as any);

            const result = await service.findById(1);

            expect(result).toEqual(minimalUser);
            expect(result.applications).toBeUndefined();
            expect(result.deletedAt).toBeUndefined();
        });

        it('should handle user with all properties including deletedAt', async () => {
            const userWithDeletedAt = {
                ...mockUser,
                deletedAt: new Date('2023-12-31T23:59:59.000Z')
            };
            repository.findOneBy.mockResolvedValue(userWithDeletedAt as any);

            const result = await service.findById(1);

            expect(result).toEqual(userWithDeletedAt);
            expect(result.deletedAt).toBeDefined();
        });

        it('should handle user with applications array', async () => {
            const userWithApplications = {
                ...mockUser,
                applications: [
                    { id: 1, name: 'App 1' },
                    { id: 2, name: 'App 2' }
                ]
            };
            repository.findOneBy.mockResolvedValue(userWithApplications as any);

            const result = await service.findById(1);

            expect(result).toEqual(userWithApplications);
            expect(result.applications).toHaveLength(2);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple concurrent requests efficiently', async () => {
            const requests = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                email: `user${i + 1}@example.com`
            }));

            repository.findOneBy.mockImplementation((criteria) => {
                const user = { ...mockUser, ...criteria };
                return Promise.resolve(user as any);
            });

            const startTime = Date.now();
            const promises = requests.flatMap(req => [
                service.findById(req.id),
                service.findByEmail(req.email)
            ]);
            const results = await Promise.all(promises);
            const endTime = Date.now();

            expect(results).toHaveLength(200);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
            expect(repository.findOneBy).toHaveBeenCalledTimes(200);
        });

        it('should handle large user IDs', async () => {
            const largeId = 999999999;
            const largeIdUser = { ...mockUser, id: largeId };
            repository.findOneBy.mockResolvedValue(largeIdUser as any);

            const result = await service.findById(largeId);

            expect(result.id).toBe(largeId);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: largeId });
        });

        it('should handle rapid successive calls', async () => {
            repository.findOneBy.mockResolvedValue(mockUser as any);

            const promises = [];
            for (let i = 0; i < 50; i++) {
                promises.push(service.findById(1));
            }

            const results = await Promise.all(promises);

            expect(results).toHaveLength(50);
            expect(results.every(result => result.id === 1)).toBe(true);
            expect(repository.findOneBy).toHaveBeenCalledTimes(50);
        });
    });

    describe('Edge Cases', () => {
        it('should handle floating point IDs', async () => {
            const floatId = 1.5;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(floatId as any)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: floatId });
        });

        it('should handle email with unicode characters', async () => {
            const unicodeEmail = 'tëst@ëxämplé.com';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(unicodeEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: unicodeEmail });
        });

        it('should handle email with spaces', async () => {
            const emailWithSpaces = ' test@example.com ';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(emailWithSpaces)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: emailWithSpaces });
        });

        it('should handle very large numbers as IDs', async () => {
            const veryLargeId = Number.MAX_SAFE_INTEGER;
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(veryLargeId)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: veryLargeId });
        });

        it('should handle email with multiple @ symbols', async () => {
            const invalidEmail = 'test@@example.com';
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.findByEmail(invalidEmail)).rejects.toThrow(UserNotFoundException);
            expect(repository.findOneBy).toHaveBeenCalledWith({ email: invalidEmail });
        });
    });
});
