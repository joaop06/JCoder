import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('./use-cases/sign-in.use-case', () => ({
    SignInUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

describe('AuthController', () => {
    let controller: AuthController;
    let signInUseCase: SignInUseCase;

    const mockSignInUseCase = {
        execute: jest.fn(),
    };

    const mockSignInDto: SignInDto = {
        username: 'testuser',
        password: 'password123',
    };

    const mockSignInResponse: SignInResponseDto = {
        accessToken: 'mock-jwt-token',
        user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            fullName: 'Test User',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: SignInUseCase,
                    useValue: mockSignInUseCase,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        signInUseCase = module.get<SignInUseCase>(SignInUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('deve fazer login com sucesso', async () => {
            mockSignInUseCase.execute.mockResolvedValue(mockSignInResponse);

            const result = await controller.signIn(mockSignInDto);

            expect(result).toEqual(mockSignInResponse);
            expect(mockSignInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
            expect(mockSignInUseCase.execute).toHaveBeenCalledTimes(1);
        });

        it('deve retornar accessToken e user no response', async () => {
            mockSignInUseCase.execute.mockResolvedValue(mockSignInResponse);

            const result = await controller.signIn(mockSignInDto);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user).toBeDefined();
        });

        it('deve propagar exceção quando senha não confere', async () => {
            const error = new Error('Password does not match');
            mockSignInUseCase.execute.mockRejectedValue(error);

            await expect(controller.signIn(mockSignInDto)).rejects.toThrow(error);
            expect(mockSignInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
        });
    });
});

