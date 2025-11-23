import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckUsernameAvailabilityUseCase } from './check-username-availability.use-case';

// Mock das entidades
jest.mock('../../administration-by-user/users/entities/user.entity', () => ({
    User: class User {},
}));

import { User } from '../../administration-by-user/users/entities/user.entity';

describe('CheckUsernameAvailabilityUseCase', () => {
    let useCase: CheckUsernameAvailabilityUseCase;
    let userRepository: Repository<User>;

    const mockUserRepository = {
        findOneBy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckUsernameAvailabilityUseCase,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<CheckUsernameAvailabilityUseCase>(CheckUsernameAvailabilityUseCase);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar disponível quando username não existe', async () => {
            const username = 'availableuser';

            mockUserRepository.findOneBy.mockResolvedValue(null);

            const result = await useCase.execute(username);

            expect(result.available).toBe(true);
            expect(result.username).toBe(username);
            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ username });
        });

        it('deve retornar não disponível quando username existe', async () => {
            const username = 'existinguser';
            const existingUser = { id: 1, username } as User;

            mockUserRepository.findOneBy.mockResolvedValue(existingUser);

            const result = await useCase.execute(username);

            expect(result.available).toBe(false);
            expect(result.username).toBe(username);
        });

        it('deve retornar não disponível quando username tem menos de 3 caracteres', async () => {
            const username = 'ab';

            const result = await useCase.execute(username);

            expect(result.available).toBe(false);
            expect(result.username).toBe(username);
            expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
        });

        it('deve retornar não disponível quando username está vazio', async () => {
            const username = '';

            const result = await useCase.execute(username);

            expect(result.available).toBe(false);
            expect(result.username).toBe(username);
            expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
        });

        it('deve retornar não disponível quando username é null', async () => {
            const username = null as any;

            const result = await useCase.execute(username);

            expect(result.available).toBe(false);
            expect(result.username).toBeNull();
            expect(mockUserRepository.findOneBy).not.toHaveBeenCalled();
        });

        it('deve retornar disponível quando username tem exatamente 3 caracteres', async () => {
            const username = 'abc';

            mockUserRepository.findOneBy.mockResolvedValue(null);

            const result = await useCase.execute(username);

            expect(result.available).toBe(true);
            expect(result.username).toBe(username);
            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ username });
        });
    });
});

