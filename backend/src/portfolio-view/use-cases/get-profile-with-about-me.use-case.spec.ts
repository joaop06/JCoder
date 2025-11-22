import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProfileWithAboutMeUseCase } from './get-profile-with-about-me.use-case';
import { CacheService } from '../../@common/services/cache.service';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';

// Mock das entidades
jest.mock('../../administration-by-user/users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços
jest.mock('../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    })),
}));

import { User } from '../../administration-by-user/users/entities/user.entity';

describe('GetProfileWithAboutMeUseCase', () => {
    let useCase: GetProfileWithAboutMeUseCase;
    let cacheService: CacheService;
    let userRepository: Repository<User>;

    const mockCacheService = {
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    };

    const mockUserRepository = {
        createQueryBuilder: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        fullName: 'Test User',
        email: 'test@example.com',
        githubUrl: 'https://github.com/test',
        linkedinUrl: 'https://linkedin.com/in/test',
        profileImage: 'image.jpg',
        userComponentAboutMe: {
            id: 1,
            occupation: 'Developer',
            description: 'Test description',
            highlights: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetProfileWithAboutMeUseCase,
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetProfileWithAboutMeUseCase>(GetProfileWithAboutMeUseCase);
        cacheService = module.get<CacheService>(CacheService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar perfil com about me usando cache', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockResolvedValue(mockUser);

            const result = await useCase.execute(username);

            expect(result).toBeDefined();
            expect(mockCacheService.generateKey).toHaveBeenCalledWith('portfolio', 'profile', username);
            expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
                cacheKey,
                expect.any(Function),
                600,
            );
        });

        it('deve buscar usuário do banco quando não está em cache', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockUser),
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await useCase.execute(username);

            expect(result).toBeDefined();
            expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.username = :username', {
                username,
            });
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
            expect(mockQueryBuilder.select).toHaveBeenCalled();
        });

        it('deve lançar exceção quando usuário não encontrado', async () => {
            const username = 'nonexistent';
            const cacheKey = 'cache:key';

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await expect(useCase.execute(username)).rejects.toThrow(UserNotFoundException);
        });

        it('deve incluir highlights do about me', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';
            const userWithHighlights = {
                ...mockUser,
                userComponentAboutMe: {
                    ...mockUser.userComponentAboutMe,
                    highlights: [
                        { id: 1, title: 'Highlight 1', subtitle: 'Subtitle 1', emoji: '🚀' },
                    ],
                },
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockResolvedValue(userWithHighlights);

            const result = await useCase.execute(username);

            expect(result).toBeDefined();
        });
    });
});

