import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dto/sign-in.dto';
import { SignInUseCase } from './sign-in.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { RoleEnum } from '../../@common/enums/role.enum';
import { UsersService } from '../../users/users.service';
import { SignInResponseDto } from '../dto/sign-in-response.dto';
import { Application } from '../../applications/entities/application.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { PasswordDoesNotMatchException } from '../exceptions/password-does-not-match.exception';

// Mock the User entity to avoid circular dependency issues
jest.mock('../../users/entities/user.entity', () => ({
    User: class MockUser {
        id: number;
        email: string;
        password: string;
        role: RoleEnum;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        applications: any[];
    }
}));

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('SignInUseCase', () => {
    let useCase: SignInUseCase;
    let jwtService: jest.Mocked<JwtService>;
    let usersService: jest.Mocked<UsersService>;

    const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedPassword',
        role: RoleEnum.User,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        deletedAt: null as Date | null,
        applications: [] as Application[],
    };

    const mockSignInDto: SignInDto = {
        email: 'test@example.com',
        password: 'plainPassword123',
    };

    const mockAccessToken = 'mock.jwt.token';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignInUseCase,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<SignInUseCase>(SignInUseCase);
        jwtService = module.get(JwtService);
        usersService = module.get(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should successfully sign in user with valid credentials', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(mockAccessToken);

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(jwtService.sign).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
                deletedAt: mockUser.deletedAt,
                applications: mockUser.applications,
            });

            expect(result).toBeInstanceOf(SignInResponseDto);
            expect(result.accessToken).toBe(mockAccessToken);
            expect(result.user).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
                deletedAt: mockUser.deletedAt,
                applications: mockUser.applications,
            });
            // Verify password is excluded from response
            expect(result.user.password).toBeUndefined();
        });

        it('should throw PasswordDoesNotMatchException when password is invalid', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(
                PasswordDoesNotMatchException,
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should propagate UserNotFoundException when user is not found', async () => {
            // Arrange
            const userNotFoundException = new UserNotFoundException();
            usersService.findByEmail.mockRejectedValue(userNotFoundException);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(
                UserNotFoundException,
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle admin user role correctly', async () => {
            // Arrange
            const adminUser = {
                ...mockUser,
                role: RoleEnum.Admin,
            };
            usersService.findByEmail.mockResolvedValue(adminUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(mockAccessToken);

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(jwtService.sign).toHaveBeenCalledWith({
                id: adminUser.id,
                email: adminUser.email,
                role: RoleEnum.Admin,
                createdAt: adminUser.createdAt,
                updatedAt: adminUser.updatedAt,
                deletedAt: adminUser.deletedAt,
                applications: adminUser.applications,
            });

            expect(result.user.role).toBe(RoleEnum.Admin);
        });

        it('should exclude password from user response', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(mockAccessToken);

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            // Verify password is excluded from response
            expect(result.user.password).toBeUndefined();
        });

        it('should handle bcrypt comparison errors', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            const bcryptError = new Error('Bcrypt comparison failed');
            mockedBcrypt.compare.mockRejectedValue(bcryptError as never);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(
                'Bcrypt comparison failed',
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should handle JWT service errors', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            const jwtError = new Error('JWT signing failed');
            jwtService.sign.mockImplementation(() => {
                throw jwtError;
            });

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(
                'JWT signing failed',
            );

            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(jwtService.sign).toHaveBeenCalled();
        });

        it('should work with different email formats', async () => {
            // Arrange
            const differentEmailDto: SignInDto = {
                email: 'user.name+tag@domain.co.uk',
                password: 'plainPassword123',
            };
            const userWithDifferentEmail = {
                ...mockUser,
                email: 'user.name+tag@domain.co.uk',
            };

            usersService.findByEmail.mockResolvedValue(userWithDifferentEmail);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(mockAccessToken);

            // Act
            const result = await useCase.execute(differentEmailDto);

            // Assert
            expect(usersService.findByEmail).toHaveBeenCalledWith(differentEmailDto.email);
            expect(result.user.email).toBe('user.name+tag@domain.co.uk');
        });

        it('should handle user with applications', async () => {
            // Arrange
            const userWithApplications = {
                ...mockUser,
                applications: [
                    { id: 1, name: 'App 1' },
                    { id: 2, name: 'App 2' },
                ],
            };

            usersService.findByEmail.mockResolvedValue(userWithApplications as User);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(mockAccessToken);

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(jwtService.sign).toHaveBeenCalledWith({
                id: userWithApplications.id,
                email: userWithApplications.email,
                role: userWithApplications.role,
                createdAt: userWithApplications.createdAt,
                updatedAt: userWithApplications.updatedAt,
                deletedAt: userWithApplications.deletedAt,
                applications: userWithApplications.applications,
            });

            expect(result.user.applications).toEqual(userWithApplications.applications);
        });
    });
});
