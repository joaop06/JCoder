import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PasswordDoesNotMatchException } from '../exceptions/password-does-not-match.exception';
import { SignInDto } from '../dto/sign-in.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

import { SignInUseCase } from './sign-in.use-case';
import { UsersService } from '../../users/users.service';
import { SignInResponseDto } from '../dto/sign-in-response.dto';

describe('SignInUseCase', () => {
    let useCase: SignInUseCase;
    let jwtService: JwtService;
    let usersService: UsersService;

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hashedPassword',
        firstName: 'Test',
        fullName: 'Test User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockSignInDto: SignInDto = {
        username: 'testuser',
        password: 'password123',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignInUseCase,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        useCase = module.get<SignInUseCase>(SignInUseCase);
        jwtService = module.get<JwtService>(JwtService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve fazer login com sucesso e retornar token', async () => {
            const mockAccessToken = 'mock-jwt-token';
            const { password, ...userWithoutPassword } = mockUser;

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(mockAccessToken);

            const result = await useCase.execute(mockSignInDto);

            expect(result).toBeInstanceOf(SignInResponseDto);
            expect(result.accessToken).toBe(mockAccessToken);
            expect(result.user).toEqual(userWithoutPassword);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({
                username: mockSignInDto.username,
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(mockJwtService.sign).toHaveBeenCalledWith(userWithoutPassword);
        });

        it('deve lançar exceção quando senha não confere', async () => {
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(useCase.execute(mockSignInDto)).rejects.toThrow(
                PasswordDoesNotMatchException,
            );

            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({
                username: mockSignInDto.username,
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockSignInDto.password,
                mockUser.password,
            );
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('deve remover senha do objeto user retornado', async () => {
            const mockAccessToken = 'mock-jwt-token';
            const { password, ...userWithoutPassword } = mockUser;

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(mockAccessToken);

            const result = await useCase.execute(mockSignInDto);

            expect(result.user).not.toHaveProperty('password');
            expect(result.user).toEqual(userWithoutPassword);
        });

        it('deve gerar token JWT com dados do usuário sem senha', async () => {
            const mockAccessToken = 'mock-jwt-token';
            const { password, ...userWithoutPassword } = mockUser;

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(mockAccessToken);

            await useCase.execute(mockSignInDto);

            expect(mockJwtService.sign).toHaveBeenCalledWith(userWithoutPassword);
            expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
        });

        it('deve usar plainToInstance para transformar resposta', async () => {
            const mockAccessToken = 'mock-jwt-token';

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(mockAccessToken);

            const result = await useCase.execute(mockSignInDto);

            expect(result).toBeInstanceOf(SignInResponseDto);
        });
    });
});

