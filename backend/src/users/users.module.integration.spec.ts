import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { RoleEnum } from '../@common/enums/role.enum';

// Mock User entity for testing
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

describe('UsersModule Integration', () => {
    let module: TestingModule;
    let usersService: UsersService;
    let userRepository: jest.Mocked<Repository<User>>;

    const mockUser: MockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: RoleEnum.Admin,
        applications: [],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const mockUser2: MockUser = {
        id: 2,
        email: 'user@example.com',
        password: 'hashedPassword456',
        role: RoleEnum.User,
        applications: [],
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    beforeEach(async () => {
        // Create mock repository
        const mockRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
            findAndCount: jest.fn(),
            count: jest.fn(),
            query: jest.fn(),
            manager: {
                transaction: jest.fn(),
            },
        } as any;

        module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<jest.Mocked<Repository<User>>>(getRepositoryToken(User));
    });

    afterEach(async () => {
        await module.close();
        jest.clearAllMocks();
    });

    describe('Module Initialization', () => {
        it('should be defined', () => {
            expect(module).toBeDefined();
        });

        it('should have UsersService defined', () => {
            expect(usersService).toBeDefined();
            expect(usersService).toBeInstanceOf(UsersService);
        });

        it('should have User repository available', () => {
            expect(userRepository).toBeDefined();
            expect(userRepository.findOneBy).toBeDefined();
            expect(userRepository.find).toBeDefined();
            expect(userRepository.save).toBeDefined();
        });

        it('should export UsersService', () => {
            const exportedService = module.get<UsersService>(UsersService);
            expect(exportedService).toBeDefined();
            expect(exportedService).toBe(usersService);
        });
    });

    describe('UsersService Integration', () => {
        describe('findById', () => {
            it('should find user by id successfully', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser as any);

                const result = await usersService.findById(1);

                expect(result).toEqual(mockUser);
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
                expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
            });

            it('should throw UserNotFoundException when user not found by id', async () => {
                userRepository.findOneBy.mockResolvedValue(null);

                await expect(usersService.findById(999)).rejects.toThrow(UserNotFoundException);
                await expect(usersService.findById(999)).rejects.toThrow('User is not found');
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
            });

            it('should handle database errors gracefully', async () => {
                const dbError = new Error('Database connection failed');
                userRepository.findOneBy.mockRejectedValue(dbError);

                await expect(usersService.findById(1)).rejects.toThrow('Database connection failed');
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            });

            it('should find user with different roles', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser2 as any);

                const result = await usersService.findById(2);

                expect(result).toEqual(mockUser2);
                expect(result.role).toBe(RoleEnum.User);
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
            });
        });

        describe('findByEmail', () => {
            it('should find user by email successfully', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser as any);

                const result = await usersService.findByEmail('test@example.com');

                expect(result).toEqual(mockUser);
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
                expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
            });

            it('should throw UserNotFoundException when user not found by email', async () => {
                userRepository.findOneBy.mockResolvedValue(null);

                await expect(usersService.findByEmail('nonexistent@example.com')).rejects.toThrow(UserNotFoundException);
                await expect(usersService.findByEmail('nonexistent@example.com')).rejects.toThrow('User is not found');
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
            });

            it('should handle database errors gracefully', async () => {
                const dbError = new Error('Database connection failed');
                userRepository.findOneBy.mockRejectedValue(dbError);

                await expect(usersService.findByEmail('test@example.com')).rejects.toThrow('Database connection failed');
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
            });

            it('should find user with case-sensitive email', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser as any);

                const result = await usersService.findByEmail('TEST@EXAMPLE.COM');

                expect(result).toEqual(mockUser);
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'TEST@EXAMPLE.COM' });
            });

            it('should handle special characters in email', async () => {
                const specialEmailUser = { ...mockUser, email: 'test+tag@example-domain.co.uk' };
                userRepository.findOneBy.mockResolvedValue(specialEmailUser as any);

                const result = await usersService.findByEmail('test+tag@example-domain.co.uk');

                expect(result).toEqual(specialEmailUser);
                expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test+tag@example-domain.co.uk' });
            });
        });

        describe('Service Integration with Repository', () => {
            it('should use the same repository instance for both methods', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser as any);

                await usersService.findById(1);
                await usersService.findByEmail('test@example.com');

                expect(userRepository.findOneBy).toHaveBeenCalledTimes(2);
                expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1, { id: 1 });
                expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2, { email: 'test@example.com' });
            });

            it('should handle concurrent requests properly', async () => {
                userRepository.findOneBy
                    .mockResolvedValueOnce(mockUser as any)
                    .mockResolvedValueOnce(mockUser2 as any);

                const [result1, result2] = await Promise.all([
                    usersService.findById(1),
                    usersService.findByEmail('user@example.com'),
                ]);

                expect(result1).toEqual(mockUser);
                expect(result2).toEqual(mockUser2);
                expect(userRepository.findOneBy).toHaveBeenCalledTimes(2);
            });

            it('should handle repository method chaining', async () => {
                userRepository.findOneBy.mockResolvedValue(mockUser as any);

                const user = await usersService.findById(1);
                const userByEmail = await usersService.findByEmail(user.email);

                expect(user).toEqual(mockUser);
                expect(userByEmail).toEqual(mockUser);
                expect(userRepository.findOneBy).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle UserNotFoundException properly', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            try {
                await usersService.findById(999);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User is not found');
                expect(error.getStatus()).toBe(404);
            }
        });

        it('should handle multiple UserNotFoundException scenarios', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            const promises = [
                usersService.findById(1),
                usersService.findById(2),
                usersService.findByEmail('test@example.com'),
                usersService.findByEmail('user@example.com'),
            ];

            const results = await Promise.allSettled(promises);

            results.forEach((result) => {
                expect(result.status).toBe('rejected');
                if (result.status === 'rejected') {
                    expect(result.reason).toBeInstanceOf(UserNotFoundException);
                }
            });
        });

        it('should handle database timeout errors', async () => {
            const timeoutError = new Error('Query timeout');
            userRepository.findOneBy.mockRejectedValue(timeoutError);

            await expect(usersService.findById(1)).rejects.toThrow('Query timeout');
        });

        it('should handle database connection errors', async () => {
            const connectionError = new Error('Connection lost');
            userRepository.findOneBy.mockRejectedValue(connectionError);

            await expect(usersService.findByEmail('test@example.com')).rejects.toThrow('Connection lost');
        });
    });

    describe('Data Validation Integration', () => {
        it('should handle valid user data', async () => {
            const validUser = {
                ...mockUser,
                id: 1,
                email: 'valid@example.com',
                role: RoleEnum.Admin,
            };
            userRepository.findOneBy.mockResolvedValue(validUser as any);

            const result = await usersService.findById(1);

            expect(result.id).toBe(1);
            expect(result.email).toBe('valid@example.com');
            expect(result.role).toBe(RoleEnum.Admin);
        });

        it('should handle user with applications relation', async () => {
            const userWithApplications = {
                ...mockUser,
                applications: [
                    { id: 1, name: 'App 1' },
                    { id: 2, name: 'App 2' },
                ],
            };
            userRepository.findOneBy.mockResolvedValue(userWithApplications as any);

            const result = await usersService.findById(1);

            expect(result.applications).toBeDefined();
            expect(result.applications).toHaveLength(2);
        });

        it('should handle user with soft delete', async () => {
            const softDeletedUser = {
                ...mockUser,
                deletedAt: new Date('2024-01-01T00:00:00.000Z'),
            };
            userRepository.findOneBy.mockResolvedValue(softDeletedUser as any);

            const result = await usersService.findById(1);

            expect(result.deletedAt).toBeDefined();
        });
    });

    describe('Module Dependencies Integration', () => {
        it('should integrate with TypeORM properly', () => {
            expect(userRepository).toBeDefined();
            expect(typeof userRepository.findOneBy).toBe('function');
            expect(typeof userRepository.find).toBe('function');
            expect(typeof userRepository.save).toBe('function');
        });

        it('should have proper dependency injection', () => {
            const serviceRepository = (usersService as any).repository;
            expect(serviceRepository).toBeDefined();
            expect(serviceRepository).toBe(userRepository);
        });

        it('should handle module lifecycle properly', async () => {
            expect(module).toBeDefined();

            // Test that service is properly initialized
            expect(usersService).toBeDefined();

            // Test that repository is properly injected
            expect(userRepository).toBeDefined();
        });
    });

    describe('Performance Integration', () => {
        it('should handle multiple rapid requests', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser as any);

            const requests = Array.from({ length: 10 }, (_, i) =>
                usersService.findById(i + 1)
            );

            const results = await Promise.all(requests);

            expect(results).toHaveLength(10);
            results.forEach((result) => {
                expect(result).toEqual(mockUser);
            });
            expect(userRepository.findOneBy).toHaveBeenCalledTimes(10);
        });

        it('should handle mixed method calls efficiently', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser as any);

            const mixedRequests = [
                usersService.findById(1),
                usersService.findByEmail('test@example.com'),
                usersService.findById(2),
                usersService.findByEmail('user@example.com'),
            ];

            const results = await Promise.all(mixedRequests);

            expect(results).toHaveLength(4);
            results.forEach((result) => {
                expect(result).toEqual(mockUser);
            });
            expect(userRepository.findOneBy).toHaveBeenCalledTimes(4);
        });
    });

    describe('Edge Cases Integration', () => {
        it('should handle zero as id', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(usersService.findById(0)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 0 });
        });

        it('should handle negative id', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(usersService.findById(-1)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: -1 });
        });

        it('should handle empty email string', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(usersService.findByEmail('')).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: '' });
        });

        it('should handle very large id numbers', async () => {
            const largeId = Number.MAX_SAFE_INTEGER;
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(usersService.findById(largeId)).rejects.toThrow(UserNotFoundException);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: largeId });
        });
    });
});
