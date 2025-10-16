import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../dto/sign-in.dto';
import { SignInUseCase } from './sign-in.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { RoleEnum } from '../../@common/enums/role.enum';
import { UsersService } from '../../users/users.service';
import { SignInResponseDto } from '../dto/sign-in-response.dto';
import { PasswordDoesNotMatchException } from '../exceptions/password-does-not-match.exception';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('SignInUseCase', () => {
    let useCase: SignInUseCase;
    let jwtService: jest.Mocked<JwtService>;
    let usersService: jest.Mocked<UsersService>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: RoleEnum.Admin,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        deletedAt: null,
        applications: [],
    } as User;

    const mockSignInDto: SignInDto = {
        email: 'test@example.com',
        password: 'plainpassword',
    };

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
        it('should be defined', () => {
            expect(useCase).toBeDefined();
        });

        it('should successfully sign in user with valid credentials', async () => {
            // Arrange
            const expectedToken = 'jwt-token';
            const expectedResponse: SignInResponseDto = {
                accessToken: expectedToken,
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                    createdAt: mockUser.createdAt,
                    updatedAt: mockUser.updatedAt,
                    deletedAt: mockUser.deletedAt,
                    applications: mockUser.applications,
                } as any,
            };

            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue(expectedToken);

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(mockSignInDto.password, mockUser.password);
            expect(jwtService.sign).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
                deletedAt: mockUser.deletedAt,
                applications: mockUser.applications,
            });
            expect(result).toEqual(expectedResponse);
            expect(result.accessToken).toBe(expectedToken);
            expect(result.user).toEqual(expectedResponse.user);
        });

        it('should throw PasswordDoesNotMatchException when password is invalid', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(PasswordDoesNotMatchException);
            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(mockSignInDto.password, mockUser.password);
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should call usersService.findByEmail with correct email', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            await useCase.execute(mockSignInDto);

            // Assert
            expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
            expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should call bcrypt.compare with correct parameters', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            await useCase.execute(mockSignInDto);

            // Assert
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('plainpassword', '$2b$10$hashedpassword');
        });

        it('should call jwtService.sign with user data (excluding password)', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            await useCase.execute(mockSignInDto);

            // Assert
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
                deletedAt: mockUser.deletedAt,
                applications: mockUser.applications,
            });
        });

        it('should return SignInResponseDto instance', async () => {
            // Arrange
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(result).toBeInstanceOf(SignInResponseDto);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
        });

        it('should handle different user roles correctly', async () => {
            // Arrange
            const userWithUserRole = { ...mockUser, role: RoleEnum.User };
            usersService.findByEmail.mockResolvedValue(userWithUserRole);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(result.user.role).toBe(RoleEnum.User);
            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({ role: RoleEnum.User })
            );
        });

        it('should handle user with applications correctly', async () => {
            // Arrange
            const userWithApplications = {
                ...mockUser,
                applications: [
                    {
                        id: 1,
                        name: 'App 1',
                        userId: 1,
                        user: mockUser,
                        description: 'Test app 1',
                        applicationType: 'API' as any,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    },
                    {
                        id: 2,
                        name: 'App 2',
                        userId: 1,
                        user: mockUser,
                        description: 'Test app 2',
                        applicationType: 'API' as any,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    },
                ] as any,
            };
            usersService.findByEmail.mockResolvedValue(userWithApplications);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockReturnValue('token');

            // Act
            const result = await useCase.execute(mockSignInDto);

            // Assert
            expect(result.user.applications).toEqual(userWithApplications.applications);
            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({ applications: userWithApplications.applications })
            );
        });

        it('should propagate errors from usersService.findByEmail', async () => {
            // Arrange
            const error = new Error('User not found');
            usersService.findByEmail.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow('User not found');
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should propagate errors from bcrypt.compare', async () => {
            // Arrange
            const error = new Error('Bcrypt error');
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockRejectedValue(error as never);

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow('Bcrypt error');
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('should propagate errors from jwtService.sign', async () => {
            // Arrange
            const error = new Error('JWT signing error');
            usersService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign.mockImplementation(() => {
                throw error;
            });

            // Act & Assert
            await expect(useCase.execute(mockSignInDto)).rejects.toThrow('JWT signing error');
        });
    });
});
