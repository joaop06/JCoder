import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUnreadMessagesStatsUseCase } from './get-unread-messages-stats.use-case';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../../@common/services/cache.service';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../../messages/entities/message.entity', () => ({
    Message: class Message {},
}));

jest.mock('../../messages/entities/conversation.entity', () => ({
    Conversation: class Conversation {},
}));

// Mock dos serviços antes de importar
jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    })),
}));

// Mock das entidades para evitar dependências circulares
class Message {}
class Conversation {}

describe('GetUnreadMessagesStatsUseCase', () => {
    let useCase: GetUnreadMessagesStatsUseCase;
    let usersService: UsersService;
    let cacheService: CacheService;
    let messageRepository: Repository<Message>;
    let conversationRepository: Repository<Conversation>;

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockCacheService = {
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
    };

    const mockMessageRepository = {
        createQueryBuilder: jest.fn(),
    };

    const mockConversationRepository = {
        find: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUnreadMessagesStatsUseCase,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockMessageRepository,
                },
                {
                    provide: getRepositoryToken(Conversation),
                    useValue: mockConversationRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetUnreadMessagesStatsUseCase>(GetUnreadMessagesStatsUseCase);
        usersService = module.get<UsersService>(UsersService);
        cacheService = module.get<CacheService>(CacheService);
        messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
        conversationRepository = module.get<Repository<Conversation>>(
            getRepositoryToken(Conversation),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar estatísticas de mensagens não lidas', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';
            const mockConversations = [{ id: 1 }, { id: 2 }];
            const mockUnreadCounts = [
                { conversationId: 1, count: '3' },
                { conversationId: 2, count: '2' },
            ];

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue(mockUnreadCounts),
            };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.find.mockResolvedValue(mockConversations);
            mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await useCase.execute(username);

            expect(result).toEqual({
                total: 5,
                conversations: 2,
            });
            expect(mockCacheService.generateKey).toHaveBeenCalledWith(
                'dashboard',
                'unread-messages',
                username,
            );
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockConversationRepository.find).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                select: ['id'],
            });
        });

        it('deve retornar zeros quando usuário não encontrado', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(null);

            const result = await useCase.execute(username);

            expect(result).toEqual({
                total: 0,
                conversations: 0,
            });
        });

        it('deve retornar zeros quando não há conversas', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.find.mockResolvedValue([]);

            const result = await useCase.execute(username);

            expect(result).toEqual({
                total: 0,
                conversations: 0,
            });
        });

        it('deve usar cache quando disponível', async () => {
            const username = 'testuser';
            const cacheKey = 'cache:key';
            const cachedData = { total: 3, conversations: 2 };

            mockCacheService.generateKey.mockReturnValue(cacheKey);
            mockCacheService.getOrSet.mockResolvedValue(cachedData);

            const result = await useCase.execute(username);

            expect(result).toEqual(cachedData);
            expect(mockUsersService.findOneBy).not.toHaveBeenCalled();
        });
    });
});

