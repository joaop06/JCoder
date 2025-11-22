import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileUseCase } from './get-profile.use-case';
import { UsersService } from '../users.service';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

describe('GetProfileUseCase', () => {
    let useCase: GetProfileUseCase;
    let usersService: UsersService;

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        fullName: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetProfileUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        useCase = module.get<GetProfileUseCase>(GetProfileUseCase);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar perfil do usuário com componentes por padrão', async () => {
            const username = 'testuser';
            const userWithComponents = {
                ...mockUser,
                userComponentAboutMe: {},
                userComponentEducation: [],
            };

            mockUsersService.findOneBy.mockResolvedValue(userWithComponents);

            const result = await useCase.execute(username);

            expect(result).toEqual(userWithComponents);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username }, true);
        });

        it('deve retornar perfil do usuário sem componentes quando solicitado', async () => {
            const username = 'testuser';

            mockUsersService.findOneBy.mockResolvedValue(mockUser);

            const result = await useCase.execute(username, false);

            expect(result).toEqual(mockUser);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username }, false);
        });

        it('deve lançar exceção quando usuário não encontrado', async () => {
            const username = 'nonexistent';

            mockUsersService.findOneBy.mockRejectedValue(new UserNotFoundException());

            await expect(useCase.execute(username)).rejects.toThrow(UserNotFoundException);
        });
    });
});

