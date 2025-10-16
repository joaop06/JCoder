import { SignInDto } from './dto/sign-in.dto';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { RoleEnum } from '../@common/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { PasswordDoesNotMatchException } from './exceptions/password-does-not-match.exception';

describe('AuthController', () => {
    let controller: AuthController;
    let signInUseCase: jest.Mocked<SignInUseCase>;

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

    const mockSignInResponse: SignInResponseDto = {
        accessToken: 'jwt-token',
        user: {
            id: mockUser.id,
            email: mockUser.email,
            password: mockUser.password,
            role: mockUser.role,
            createdAt: mockUser.createdAt,
            updatedAt: mockUser.updatedAt,
            deletedAt: mockUser.deletedAt,
            applications: mockUser.applications,
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: SignInUseCase,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        signInUseCase = module.get(SignInUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('should be defined', () => {
            expect(controller).toBeDefined();
        });

        it('should successfully sign in user with valid credentials', async () => {
            // Arrange
            signInUseCase.execute.mockResolvedValue(mockSignInResponse);

            // Act
            const result = await controller.signIn(mockSignInDto);

            // Assert
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
            expect(result).toEqual(mockSignInResponse);
            expect(result.accessToken).toBe('jwt-token');
            expect(result.user).toEqual(mockSignInResponse.user);
        });

        it('should call signInUseCase.execute with correct parameters', async () => {
            // Arrange
            signInUseCase.execute.mockResolvedValue(mockSignInResponse);

            // Act
            await controller.signIn(mockSignInDto);

            // Assert
            expect(signInUseCase.execute).toHaveBeenCalledTimes(1);
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });

        it('should return SignInResponseDto instance', async () => {
            // Arrange
            signInUseCase.execute.mockResolvedValue(mockSignInResponse);

            // Act
            const result = await controller.signIn(mockSignInDto);

            // Assert
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.accessToken).toBe(mockSignInResponse.accessToken);
            expect(result.user).toEqual(mockSignInResponse.user);
        });

        it('should propagate PasswordDoesNotMatchException from use case', async () => {
            // Arrange
            const exception = new PasswordDoesNotMatchException();
            signInUseCase.execute.mockRejectedValue(exception);

            // Act & Assert
            await expect(controller.signIn(mockSignInDto)).rejects.toThrow(PasswordDoesNotMatchException);
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });

        it('should propagate other errors from use case', async () => {
            // Arrange
            const error = new Error('Some error');
            signInUseCase.execute.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.signIn(mockSignInDto)).rejects.toThrow('Some error');
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });

        it('should handle different user roles correctly', async () => {
            // Arrange
            const userWithUserRole = { ...mockUser, role: RoleEnum.User };
            const responseWithUserRole = {
                ...mockSignInResponse,
                user: { ...mockSignInResponse.user, role: RoleEnum.User },
            };
            signInUseCase.execute.mockResolvedValue(responseWithUserRole);

            // Act
            const result = await controller.signIn(mockSignInDto);

            // Assert
            expect(result.user.role).toBe(RoleEnum.User);
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
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
            const responseWithApplications = {
                ...mockSignInResponse,
                user: { ...mockSignInResponse.user, applications: userWithApplications.applications },
            };
            signInUseCase.execute.mockResolvedValue(responseWithApplications);

            // Act
            const result = await controller.signIn(mockSignInDto);

            // Assert
            expect(result.user.applications).toEqual(userWithApplications.applications);
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });

        it('should handle different email formats', async () => {
            // Arrange
            const differentEmailDto = { ...mockSignInDto, email: 'another@example.com' };
            const differentEmailResponse = {
                ...mockSignInResponse,
                user: { ...mockSignInResponse.user, email: 'another@example.com' },
            };
            signInUseCase.execute.mockResolvedValue(differentEmailResponse);

            // Act
            const result = await controller.signIn(differentEmailDto);

            // Assert
            expect(result.user.email).toBe('another@example.com');
            expect(signInUseCase.execute).toHaveBeenCalledWith(differentEmailDto);
        });

        it('should handle long JWT tokens', async () => {
            // Arrange
            const longToken = 'a'.repeat(1000);
            const responseWithLongToken = {
                ...mockSignInResponse,
                accessToken: longToken,
            };
            signInUseCase.execute.mockResolvedValue(responseWithLongToken);

            // Act
            const result = await controller.signIn(mockSignInDto);

            // Assert
            expect(result.accessToken).toBe(longToken);
            expect(result.accessToken.length).toBe(1000);
            expect(signInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });

        it('should handle async operations correctly', async () => {
            // Arrange
            let resolvePromise: (value: SignInResponseDto) => void;
            const promise = new Promise<SignInResponseDto>((resolve) => {
                resolvePromise = resolve;
            });
            signInUseCase.execute.mockReturnValue(promise);

            // Act
            const resultPromise = controller.signIn(mockSignInDto);

            // Assert - should not resolve immediately
            await expect(Promise.race([
                resultPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
            ])).rejects.toThrow('Timeout');

            // Resolve the promise
            resolvePromise!(mockSignInResponse);
            const result = await resultPromise;

            // Assert
            expect(result).toEqual(mockSignInResponse);
        });

        it('should maintain method signature compatibility', () => {
            // This test ensures the method signature matches the expected interface
            const method = controller.signIn;
            expect(typeof method).toBe('function');
            expect(method.length).toBe(1); // Should accept one parameter (signInDto)
        });
    });
});
