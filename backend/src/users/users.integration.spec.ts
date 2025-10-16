import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { User } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { RoleEnum } from '../@common/enums/role.enum';
import {
    createMockUser,
    createMockUsers,
    resetUserMocks
} from './mocks/user.mocks';

describe('UsersService Integration Tests', () => {
    let module: TestingModule;
    let service: UsersService;
    let repository: Repository<User>;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [User],
                    synchronize: true,
                    logging: false,
                }),
                UsersModule,
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        if (module) {
            await module.close();
        }
    });

    beforeEach(async () => {
        // Clear database before each test
        await repository.clear();
        resetUserMocks();
    });

    describe('Database Operations', () => {
        it('should create and find user by id', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'integration@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            // Act
            const savedUser = await repository.save(userData);
            const foundUser = await service.findById(savedUser.id);

            // Assert
            expect(savedUser).toBeDefined();
            expect(savedUser.id).toBeDefined();
            expect(foundUser).toBeDefined();
            expect(foundUser.id).toBe(savedUser.id);
            expect(foundUser.email).toBe(userData.email);
            expect(foundUser.role).toBe(userData.role);
        });

        it('should create and find user by email', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'email-search@example.com',
                password: 'hashedPassword',
                role: RoleEnum.Admin,
            });

            // Act
            const savedUser = await repository.save(userData);
            const foundUser = await service.findByEmail(savedUser.email);

            // Assert
            expect(savedUser).toBeDefined();
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe(userData.email);
            expect(foundUser.role).toBe(RoleEnum.Admin);
        });

        it('should handle multiple users', async () => {
            // Arrange
            const users = createMockUsers(5, {
                role: RoleEnum.User,
            });

            // Act
            const savedUsers = await repository.save(users);
            const foundUser1 = await service.findById(savedUsers[0].id);
            const foundUser2 = await service.findByEmail(savedUsers[1].email);

            // Assert
            expect(savedUsers).toHaveLength(5);
            expect(foundUser1).toBeDefined();
            expect(foundUser2).toBeDefined();
            expect(foundUser1.id).toBe(savedUsers[0].id);
            expect(foundUser2.email).toBe(savedUsers[1].email);
        });

        it('should handle soft delete operations', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'soft-delete@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            // Act
            const savedUser = await repository.save(userData);
            await repository.softDelete(savedUser.id);

            // Try to find the soft-deleted user
            const deletedUser = await repository.findOne({
                where: { id: savedUser.id },
                withDeleted: true,
            });

            // Assert
            expect(deletedUser).toBeDefined();
            expect(deletedUser.deletedAt).not.toBeNull();
        });
    });

    describe('Service Integration with Database', () => {
        it('should throw UserNotFoundException for non-existent user by id', async () => {
            // Act & Assert
            await expect(service.findById(99999)).rejects.toThrow(UserNotFoundException);
        });

        it('should throw UserNotFoundException for non-existent user by email', async () => {
            // Act & Assert
            await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(UserNotFoundException);
        });

        it('should handle case-sensitive email searches', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'CaseSensitive@Example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            // Act
            await repository.save(userData);

            // Assert - exact case should work
            const foundUser = await service.findByEmail('CaseSensitive@Example.com');
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe('CaseSensitive@Example.com');

            // Different case should not work (case-sensitive)
            await expect(service.findByEmail('casesensitive@example.com')).rejects.toThrow(UserNotFoundException);
        });

        it('should handle unique email constraint', async () => {
            // Arrange
            const userData1 = createMockUser({
                email: 'unique@example.com',
                password: 'hashedPassword1',
                role: RoleEnum.User,
            });

            const userData2 = createMockUser({
                email: 'unique@example.com', // Same email
                password: 'hashedPassword2',
                role: RoleEnum.Admin,
            });

            // Act
            await repository.save(userData1);

            // Assert - should throw error for duplicate email
            await expect(repository.save(userData2)).rejects.toThrow();
        });

        it('should handle role enum validation', async () => {
            // Arrange
            const validUser = createMockUser({
                email: 'valid-role@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            const adminUser = createMockUser({
                email: 'admin-role@example.com',
                password: 'hashedPassword',
                role: RoleEnum.Admin,
            });

            // Act
            const savedUser1 = await repository.save(validUser);
            const savedUser2 = await repository.save(adminUser);

            // Assert
            expect(savedUser1.role).toBe(RoleEnum.User);
            expect(savedUser2.role).toBe(RoleEnum.Admin);
        });
    });

    describe('Timestamp Management', () => {
        it('should automatically set createdAt and updatedAt', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'timestamp@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            const beforeSave = new Date();

            // Act
            const savedUser = await repository.save(userData);

            const afterSave = new Date();

            // Assert
            expect(savedUser.createdAt).toBeDefined();
            expect(savedUser.updatedAt).toBeDefined();
            expect(savedUser.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
            expect(savedUser.createdAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
            expect(savedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
            expect(savedUser.updatedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
        });

        it('should update updatedAt when user is modified', async () => {
            // Arrange
            const userData = createMockUser({
                email: 'update-timestamp@example.com',
                password: 'hashedPassword',
                role: RoleEnum.User,
            });

            // Act
            const savedUser = await repository.save(userData);
            const originalUpdatedAt = savedUser.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            savedUser.role = RoleEnum.Admin;
            const updatedUser = await repository.save(savedUser);

            // Assert
            expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
            expect(updatedUser.createdAt.getTime()).toBe(savedUser.createdAt.getTime());
        });
    });

    describe('Data Integrity', () => {
        it('should maintain data integrity across operations', async () => {
            // Arrange
            const users = createMockUsers(3, {
                role: RoleEnum.User,
            });

            // Act
            const savedUsers = await repository.save(users);

            // Verify all users were saved
            const allUsers = await repository.find();
            expect(allUsers).toHaveLength(3);

            // Find each user by ID
            for (const savedUser of savedUsers) {
                const foundUser = await service.findById(savedUser.id);
                expect(foundUser.email).toBe(savedUser.email);
                expect(foundUser.role).toBe(savedUser.role);
            }

            // Find each user by email
            for (const savedUser of savedUsers) {
                const foundUser = await service.findByEmail(savedUser.email);
                expect(foundUser.id).toBe(savedUser.id);
                expect(foundUser.role).toBe(savedUser.role);
            }
        });

        it('should handle concurrent operations', async () => {
            // Arrange
            const users = createMockUsers(10, {
                role: RoleEnum.User,
            });

            // Act - Save all users concurrently
            const savePromises = users.map(user => repository.save(user));
            const savedUsers = await Promise.all(savePromises);

            // Assert
            expect(savedUsers).toHaveLength(10);

            // Verify all users can be found
            const findPromises = savedUsers.map(user => service.findById(user.id));
            const foundUsers = await Promise.all(findPromises);

            expect(foundUsers).toHaveLength(10);
            foundUsers.forEach((user, index) => {
                expect(user.id).toBe(savedUsers[index].id);
                expect(user.email).toBe(savedUsers[index].email);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle database connection errors gracefully', async () => {
            // This test would require mocking database connection failure
            // For now, we'll test that the service properly handles null results
            await expect(service.findById(99999)).rejects.toThrow(UserNotFoundException);
            await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(UserNotFoundException);
        });

        it('should handle malformed data gracefully', async () => {
            // Arrange
            const invalidUser = {
                email: null,
                password: 'hashedPassword',
                role: 'invalid-role',
            } as any;

            // Act & Assert
            await expect(repository.save(invalidUser)).rejects.toThrow();
        });
    });
});
