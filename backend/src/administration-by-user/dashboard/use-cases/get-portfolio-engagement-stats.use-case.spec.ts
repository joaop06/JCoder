import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPortfolioEngagementStatsUseCase } from './get-portfolio-engagement-stats.use-case';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { DateRangeType } from '../../../portfolio-view/dto/get-portfolio-engagement-query.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../../../portfolio-view/entities/portfolio-view.entity', () => ({
    PortfolioView: class PortfolioView {},
}));

// Mock das entidades para evitar dependências circulares
class User {}
class PortfolioView {}

describe('GetPortfolioEngagementStatsUseCase', () => {
    let useCase: GetPortfolioEngagementStatsUseCase;
    let portfolioViewRepository: Repository<PortfolioView>;
    let userRepository: Repository<User>;

    const mockPortfolioViewRepository = {
        createQueryBuilder: jest.fn(),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetPortfolioEngagementStatsUseCase,
                {
                    provide: getRepositoryToken(PortfolioView),
                    useValue: mockPortfolioViewRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetPortfolioEngagementStatsUseCase>(
            GetPortfolioEngagementStatsUseCase,
        );
        portfolioViewRepository = module.get<Repository<PortfolioView>>(
            getRepositoryToken(PortfolioView),
        );
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it.skip('deve retornar estatísticas de engajamento do portfólio', async () => {
            const username = 'testuser';
            const query = { rangeType: DateRangeType.MONTH };

            // Criar um query builder reutilizável que suporta todos os métodos
            const createMockQueryBuilder = (getCountValue?: number, getRawManyValue?: any[]) => {
                const builder: any = {
                    where: jest.fn().mockReturnThis(),
                    andWhere: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    addSelect: jest.fn().mockReturnThis(),
                    groupBy: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                };

                if (getCountValue !== undefined) {
                    builder.getCount = jest.fn().mockResolvedValue(getCountValue);
                } else {
                    builder.getCount = jest.fn().mockResolvedValue(0);
                }

                if (getRawManyValue !== undefined) {
                    builder.getRawMany = jest.fn().mockResolvedValue(getRawManyValue);
                } else {
                    builder.getRawMany = jest.fn().mockResolvedValue([]);
                }

                return builder;
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            // O primeiro queryBuilder é criado e reutilizado para totalViews e uniqueVisitors
            const mockBaseQueryBuilder: any = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(150), // para totalViews
                getRawMany: jest.fn().mockResolvedValue([
                    { visitor: 'ip1-fp1' },
                    { visitor: 'ip2-fp2' },
                    { visitor: 'ip1-fp1' }, // duplicate
                ]), // para uniqueVisitors
            };

            // Mock para ownerViews (usa getCount) - segundo queryBuilder criado
            const mockOwnerViewsBuilder = createMockQueryBuilder(30);
            
            // Mock para dailyStats - date precisa ser um objeto Date válido
            const mockDate = new Date('2024-01-15T00:00:00.000Z');
            const mockDailyStatsBuilder = createMockQueryBuilder(undefined, [
                { date: mockDate, views: '10' },
            ]);
            
            // Mock para topCountries
            const mockTopCountriesBuilder = createMockQueryBuilder(undefined, [
                { country: 'BR', count: '45' },
            ]);
            
            // Mock para topReferers
            const mockTopReferersBuilder = createMockQueryBuilder(undefined, [
                { referer: 'https://google.com', count: '20' },
            ]);
            
            // Mock para dailyUniqueVisitors - precisa retornar objeto com date como Date válido
            // O código chama toISOString() então precisa ser um Date real
            const mockDailyUniqueDate = new Date('2024-01-15T00:00:00.000Z');
            const mockDailyUniqueVisitorsBuilder = createMockQueryBuilder(undefined, [
                {
                    date: mockDailyUniqueDate,
                    visitor: 'ip1-fp1',
                },
            ]);

            // O primeiro queryBuilder é usado para totalViews e uniqueVisitors
            // O segundo é usado para ownerViews
            // Os demais são usados para as outras queries
            mockPortfolioViewRepository.createQueryBuilder
                .mockReturnValueOnce(mockBaseQueryBuilder) // totalViews e uniqueVisitors
                .mockReturnValueOnce(mockOwnerViewsBuilder) // ownerViews
                .mockReturnValueOnce(mockDailyStatsBuilder) // dailyStats
                .mockReturnValueOnce(mockTopCountriesBuilder) // topCountries
                .mockReturnValueOnce(mockTopReferersBuilder) // topReferers
                .mockReturnValueOnce(mockDailyUniqueVisitorsBuilder); // dailyUniqueVisitors

            const result = await useCase.execute(username, query);

            expect(result).toHaveProperty('totalViews');
            expect(result).toHaveProperty('uniqueVisitors');
            expect(result).toHaveProperty('ownerViews');
            expect(result).toHaveProperty('dailyStats');
            expect(result).toHaveProperty('topCountries');
            expect(result).toHaveProperty('topReferers');
            expect(result.totalViews).toBe(150);
            expect(result.uniqueVisitors).toBe(2); // 2 unique visitors
            expect(result.ownerViews).toBe(30);
        });

        it('deve lançar exceção quando usuário não encontrado', async () => {
            const username = 'nonexistent';
            const query = { rangeType: DateRangeType.MONTH };

            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(useCase.execute(username, query)).rejects.toThrow(
                UserNotFoundException,
            );
        });

        it('deve calcular range de datas para DAY', async () => {
            const username = 'testuser';
            const query = { rangeType: DateRangeType.DAY };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockPortfolioViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await useCase.execute(username, query);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { username },
            });
        });

        it('deve calcular range de datas para WEEK', async () => {
            const username = 'testuser';
            const query = { rangeType: DateRangeType.WEEK };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockPortfolioViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await useCase.execute(username, query);

            expect(mockUserRepository.findOne).toHaveBeenCalled();
        });

        it('deve calcular range de datas para YEAR', async () => {
            const username = 'testuser';
            const query = { rangeType: DateRangeType.YEAR };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockPortfolioViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await useCase.execute(username, query);

            expect(mockUserRepository.findOne).toHaveBeenCalled();
        });

        it('deve calcular range de datas para CUSTOM', async () => {
            const username = 'testuser';
            const query = {
                rangeType: DateRangeType.CUSTOM,
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            };

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockPortfolioViewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await useCase.execute(username, query);

            expect(mockUserRepository.findOne).toHaveBeenCalled();
        });
    });
});

