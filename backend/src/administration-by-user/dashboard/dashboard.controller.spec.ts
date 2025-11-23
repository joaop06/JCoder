import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';
import { GetPortfolioEngagementStatsUseCase } from './use-cases/get-portfolio-engagement-stats.use-case';
import { DateRangeType } from '../../portfolio-view/dto/get-portfolio-engagement-query.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos use-cases antes de importar
jest.mock('./use-cases/get-applications-stats.use-case', () => ({
    GetApplicationsStatsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-technologies-stats.use-case', () => ({
    GetTechnologiesStatsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-unread-messages-stats.use-case', () => ({
    GetUnreadMessagesStatsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-profile-completeness.use-case', () => ({
    GetProfileCompletenessUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/get-portfolio-engagement-stats.use-case', () => ({
    GetPortfolioEngagementStatsUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

describe('DashboardController', () => {
    let controller: DashboardController;
    let getApplicationsStatsUseCase: GetApplicationsStatsUseCase;
    let getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase;
    let getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase;
    let getProfileCompletenessUseCase: GetProfileCompletenessUseCase;
    let getPortfolioEngagementStatsUseCase: GetPortfolioEngagementStatsUseCase;

    const mockGetApplicationsStatsUseCase = {
        execute: jest.fn(),
    };

    const mockGetTechnologiesStatsUseCase = {
        execute: jest.fn(),
    };

    const mockGetUnreadMessagesStatsUseCase = {
        execute: jest.fn(),
    };

    const mockGetProfileCompletenessUseCase = {
        execute: jest.fn(),
    };

    const mockGetPortfolioEngagementStatsUseCase = {
        execute: jest.fn(),
    };

    const mockApplicationsStats = {
        total: 10,
        active: 7,
        inactive: 3,
    };

    const mockTechnologiesStats = {
        total: 5,
    };

    const mockUnreadMessages = {
        total: 5,
        conversations: 3,
    };

    const mockProfileCompleteness = {
        percentage: 75,
        completedFields: 9,
        totalFields: 12,
        fields: {},
    };

    const mockPortfolioEngagement = {
        totalViews: 150,
        uniqueVisitors: 120,
        ownerViews: 30,
        dailyStats: [],
        topCountries: [],
        topReferers: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DashboardController],
            providers: [
                {
                    provide: GetApplicationsStatsUseCase,
                    useValue: mockGetApplicationsStatsUseCase,
                },
                {
                    provide: GetTechnologiesStatsUseCase,
                    useValue: mockGetTechnologiesStatsUseCase,
                },
                {
                    provide: GetUnreadMessagesStatsUseCase,
                    useValue: mockGetUnreadMessagesStatsUseCase,
                },
                {
                    provide: GetProfileCompletenessUseCase,
                    useValue: mockGetProfileCompletenessUseCase,
                },
                {
                    provide: GetPortfolioEngagementStatsUseCase,
                    useValue: mockGetPortfolioEngagementStatsUseCase,
                },
            ],
        }).compile();

        controller = module.get<DashboardController>(DashboardController);
        getApplicationsStatsUseCase = module.get<GetApplicationsStatsUseCase>(
            GetApplicationsStatsUseCase,
        );
        getTechnologiesStatsUseCase = module.get<GetTechnologiesStatsUseCase>(
            GetTechnologiesStatsUseCase,
        );
        getUnreadMessagesStatsUseCase = module.get<GetUnreadMessagesStatsUseCase>(
            GetUnreadMessagesStatsUseCase,
        );
        getProfileCompletenessUseCase = module.get<GetProfileCompletenessUseCase>(
            GetProfileCompletenessUseCase,
        );
        getPortfolioEngagementStatsUseCase = module.get<GetPortfolioEngagementStatsUseCase>(
            GetPortfolioEngagementStatsUseCase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getApplicationsStats', () => {
        it('deve retornar estatísticas de aplicações', async () => {
            const username = 'testuser';

            mockGetApplicationsStatsUseCase.execute.mockResolvedValue(mockApplicationsStats);

            const result = await controller.getApplicationsStats(username);

            expect(result).toEqual(mockApplicationsStats);
            expect(mockGetApplicationsStatsUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('getTechnologiesStats', () => {
        it('deve retornar estatísticas de tecnologias', async () => {
            const username = 'testuser';

            mockGetTechnologiesStatsUseCase.execute.mockResolvedValue(mockTechnologiesStats);

            const result = await controller.getTechnologiesStats(username);

            expect(result).toEqual(mockTechnologiesStats);
            expect(mockGetTechnologiesStatsUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('getUnreadMessagesStats', () => {
        it('deve retornar estatísticas de mensagens não lidas', async () => {
            const username = 'testuser';

            mockGetUnreadMessagesStatsUseCase.execute.mockResolvedValue(mockUnreadMessages);

            const result = await controller.getUnreadMessagesStats(username);

            expect(result).toEqual(mockUnreadMessages);
            expect(mockGetUnreadMessagesStatsUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('getProfileCompleteness', () => {
        it('deve retornar completude do perfil', async () => {
            const username = 'testuser';

            mockGetProfileCompletenessUseCase.execute.mockResolvedValue(mockProfileCompleteness);

            const result = await controller.getProfileCompleteness(username);

            expect(result).toEqual(mockProfileCompleteness);
            expect(mockGetProfileCompletenessUseCase.execute).toHaveBeenCalledWith(username);
        });
    });

    describe('getPortfolioEngagementStats', () => {
        it('deve retornar estatísticas de engajamento do portfólio', async () => {
            const username = 'testuser';
            const query = { rangeType: DateRangeType.MONTH };

            mockGetPortfolioEngagementStatsUseCase.execute.mockResolvedValue(
                mockPortfolioEngagement,
            );

            const result = await controller.getPortfolioEngagementStats(username, query);

            expect(result).toEqual(mockPortfolioEngagement);
            expect(mockGetPortfolioEngagementStatsUseCase.execute).toHaveBeenCalledWith(
                username,
                query,
            );
        });
    });
});

