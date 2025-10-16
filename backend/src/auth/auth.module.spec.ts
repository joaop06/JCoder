import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { SignInDto } from './dto/sign-in.dto';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RoleEnum } from '../@common/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { JwtStrategy } from '../@common/strategies/jwt.strategy';
import { PasswordDoesNotMatchException } from './exceptions/password-does-not-match.exception';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthModule Integration', () => {
    let module: TestingModule;
    let authController: AuthController;
    let signInUseCase: SignInUseCase;
    let jwtService: JwtService;
    let usersService: UsersService;
    let userRepository: jest.Mocked<Repository<User>>;

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
        module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '60m' },
                }),
                PassportModule,
            ],
            controllers: [AuthController],
            providers: [
                SignInUseCase,
                JwtStrategy,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn().mockResolvedValue(mockUser),
                        findById: jest.fn().mockResolvedValue(mockUser),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneBy: jest.fn(),
                        find: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        create: jest.fn(),
                        clear: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        signInUseCase = module.get<SignInUseCase>(SignInUseCase);
        jwtService = module.get<JwtService>(JwtService);
        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(async () => {
        await module.close();
        jest.clearAllMocks();
    });

    describe('Module Dependencies', () => {
        it('should compile the module successfully', () => {
            expect(module).toBeDefined();
        });

        it('should provide AuthController', () => {
            expect(authController).toBeDefined();
            expect(authController).toBeInstanceOf(AuthController);
        });

        it('should provide SignInUseCase', () => {
            expect(signInUseCase).toBeDefined();
            expect(signInUseCase).toBeInstanceOf(SignInUseCase);
        });

        it('should provide JwtService', () => {
            expect(jwtService).toBeDefined();
            expect(jwtService).toBeInstanceOf(JwtService);
        });

        it('should provide UsersService', () => {
            expect(usersService).toBeDefined();
            expect(usersService).toHaveProperty('findByEmail');
            expect(usersService).toHaveProperty('findById');
        });

        it('should provide JwtStrategy', () => {
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
            expect(jwtStrategy).toBeDefined();
            expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
        });
    });

    describe('End-to-End Integration', () => {
        it('should successfully authenticate user through complete flow', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await authController.signIn(mockSignInDto);

            // Assert
            expect(result).toBeDefined();
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(mockSignInDto.email);
            expect(result.user.id).toBe(mockUser.id);
            expect(result.user.role).toBe(mockUser.role);
            expect(typeof result.accessToken).toBe('string');
            expect(result.accessToken.length).toBeGreaterThan(0);
        });

        it('should handle authentication failure through complete flow', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(false as never);

            // Act & Assert
            await expect(authController.signIn(mockSignInDto)).rejects.toThrow(PasswordDoesNotMatchException);
        });

        it('should generate valid JWT token', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await authController.signIn(mockSignInDto);

            // Assert
            const decodedToken = jwtService.decode(result.accessToken) as any;
            expect(decodedToken).toBeDefined();
            expect(decodedToken.email).toBe(mockUser.email);
            expect(decodedToken.id).toBe(mockUser.id);
            expect(decodedToken.role).toBe(mockUser.role);
        });

        it('should exclude password from JWT payload', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await authController.signIn(mockSignInDto);

            // Assert
            const decodedToken = jwtService.decode(result.accessToken) as any;
            expect(decodedToken.password).toBeUndefined();
        });

        it('should exclude password from response user object', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await authController.signIn(mockSignInDto);

            // Assert
            expect(result.user).not.toHaveProperty('password');
            expect(result.user.id).toBe(mockUser.id);
            expect(result.user.email).toBe(mockUser.email);
            expect(result.user.role).toBe(mockUser.role);
        });
    });

    describe('Service Integration', () => {
        it('should integrate SignInUseCase with UsersService', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            await signInUseCase.execute(mockSignInDto);

            // Assert
            expect(usersService.findByEmail).toHaveBeenCalledWith(mockSignInDto.email);
        });

        it('should integrate SignInUseCase with JwtService', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await signInUseCase.execute(mockSignInDto);

            // Assert
            expect(result.accessToken).toBeDefined();
            expect(typeof result.accessToken).toBe('string');

            // Verify token can be decoded
            const decodedToken = jwtService.decode(result.accessToken) as any;
            expect(decodedToken).toBeDefined();
        });
    });

    describe('JWT Strategy Integration', () => {
        it('should validate JWT token correctly', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);

            // Act
            const result = await authController.signIn(mockSignInDto);
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);

            // Assert
            const decodedToken = jwtService.decode(result.accessToken) as any;
            const validatedPayload = await jwtStrategy.validate(decodedToken);

            expect(validatedPayload).toBeDefined();
            expect(validatedPayload.email).toBe(mockUser.email);
            expect(validatedPayload.userId).toBe(mockUser.id);
            expect(validatedPayload.role).toBe(mockUser.role);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle bcrypt errors gracefully', async () => {
            // Arrange
            mockedBcrypt.compare.mockRejectedValue(new Error('Bcrypt error') as never);

            // Act & Assert
            await expect(authController.signIn(mockSignInDto)).rejects.toThrow('Bcrypt error');
        });

        it('should handle JWT signing errors gracefully', async () => {
            // Arrange
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jest.spyOn(jwtService, 'sign').mockImplementation(() => {
                throw new Error('JWT signing failed');
            });

            // Act & Assert
            await expect(authController.signIn(mockSignInDto)).rejects.toThrow('JWT signing failed');
        });
    });

    describe('Module Configuration', () => {
        it('should have correct JWT configuration', () => {
            const jwtModule = module.get<JwtModule>(JwtModule);
            expect(jwtModule).toBeDefined();
        });

        it('should have PassportModule imported', () => {
            const passportModule = module.get<PassportModule>(PassportModule);
            expect(passportModule).toBeDefined();
        });
    });
});
