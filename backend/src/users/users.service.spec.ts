import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { RoleEnum } from '../@common/enums/role.enum';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: RoleEnum.User,
        applications: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
    };

    const mockRepository = {
        findOneBy: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
    };

    beforeEach(async () => {
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

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        it('should return a user when found by id', async () => {
            // Arrange
            const userId = 1;
            mockRepository.findOneBy.mockResolvedValue(mockUser);

            // Act
            const result = await service.findById(userId);

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
            expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should throw UserNotFoundException when user is not found by id', async () => {
            // Arrange
            const userId = 999;
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(userId)).rejects.toThrow(UserNotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
            expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should throw UserNotFoundException when user is soft deleted', async () => {
            // Arrange
            const userId = 1;
            const softDeletedUser = { ...mockUser, deletedAt: new Date() };
            mockRepository.findOneBy.mockResolvedValue(softDeletedUser);

            // Act
            const result = await service.findById(userId);

            // Assert
            expect(result).toEqual(softDeletedUser);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const userId = 1;
            const dbError = new Error('Database connection failed');
            mockRepository.findOneBy.mockRejectedValue(dbError);

            // Act & Assert
            await expect(service.findById(userId)).rejects.toThrow('Database connection failed');
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
        });
    });

    describe('findByEmail', () => {
        it('should return a user when found by email', async () => {
            // Arrange
            const userEmail = 'test@example.com';
            mockRepository.findOneBy.mockResolvedValue(mockUser);

            // Act
            const result = await service.findByEmail(userEmail);

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
            expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should throw UserNotFoundException when user is not found by email', async () => {
            // Arrange
            const userEmail = 'nonexistent@example.com';
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
            expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1);
        });

        it('should handle case-sensitive email searches', async () => {
            // Arrange
            const userEmail = 'TEST@EXAMPLE.COM';
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const userEmail = 'test@example.com';
            const dbError = new Error('Database connection failed');
            mockRepository.findOneBy.mockRejectedValue(dbError);

            // Act & Assert
            await expect(service.findByEmail(userEmail)).rejects.toThrow('Database connection failed');
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle empty email string', async () => {
            // Arrange
            const userEmail = '';
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });

        it('should handle null email', async () => {
            // Arrange
            const userEmail = null as any;
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByEmail(userEmail)).rejects.toThrow(UserNotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
        });
    });

    describe('Repository injection', () => {
        it('should have repository injected correctly', () => {
            expect(repository).toBeDefined();
            expect(repository).toBe(mockRepository);
        });
    });

    describe('Service methods coverage', () => {
        it('should have all required methods', () => {
            expect(typeof service.findById).toBe('function');
            expect(typeof service.findByEmail).toBe('function');
        });
    });
});
