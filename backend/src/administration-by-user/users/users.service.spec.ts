import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('./entities/user.entity', () => ({
    User: class User {},
}));

import { User } from './entities/user.entity';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        fullName: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

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

    describe('existsBy', () => {
        it('deve retornar true quando usuário existe', async () => {
            const where = { username: 'testuser' };

            mockRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.existsBy(where);

            expect(result).toBe(true);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(where);
        });

        it('deve retornar false quando usuário não existe', async () => {
            const where = { username: 'nonexistent' };

            mockRepository.findOneBy.mockResolvedValue(null);

            const result = await service.existsBy(where);

            expect(result).toBe(false);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(where);
        });
    });

    describe('update', () => {
        it('deve atualizar um usuário', async () => {
            const updatedUser = { ...mockUser, firstName: 'Updated' };

            mockRepository.save.mockResolvedValue(updatedUser);

            const result = await service.update(mockUser);

            expect(result).toEqual(updatedUser);
            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('findOneBy', () => {
        it('deve retornar usuário sem componentes quando includeComponents é false', async () => {
            const where = { username: 'testuser' };

            mockRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findOneBy(where, false);

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(where);
            expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
        });

        it('deve retornar usuário sem componentes quando includeComponents não é fornecido', async () => {
            const where = { username: 'testuser' };

            mockRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findOneBy(where);

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(where);
            expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando usuário não encontrado sem componentes', async () => {
            const where = { username: 'nonexistent' };

            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOneBy(where, false)).rejects.toThrow(
                UserNotFoundException,
            );
        });

        it('deve retornar usuário com componentes quando includeComponents é true', async () => {
            const where = { username: 'testuser' };
            const userWithComponents = {
                ...mockUser,
                userComponentAboutMe: {},
                userComponentEducation: [],
            };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(userWithComponents),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findOneBy(where, true);

            expect(result).toEqual(userWithComponents);
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(7);
        });

        it('deve lançar exceção quando usuário não encontrado com componentes', async () => {
            const where = { username: 'nonexistent' };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await expect(service.findOneBy(where, true)).rejects.toThrow(
                UserNotFoundException,
            );
        });

        it('deve construir query corretamente com múltiplas condições where', async () => {
            const where = { username: 'testuser', email: 'test@example.com' };
            const userWithComponents = { ...mockUser };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(userWithComponents),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.findOneBy(where, true);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                expect.stringContaining('user.username'),
                expect.any(Object),
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                expect.stringContaining('user.email'),
                expect.any(Object),
            );
        });
    });
});

