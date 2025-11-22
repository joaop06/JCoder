import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';

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

describe('DashboardService', () => {
    let service: DashboardService;
    let getApplicationsStatsUseCase: GetApplicationsStatsUseCase;
    let getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase;
    let getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase;
    let getProfileCompletenessUseCase: GetProfileCompletenessUseCase;

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
        fields: {
            profileImage: true,
            fullName: true,
            email: true,
            phone: false,
            address: false,
            githubUrl: true,
            linkedinUrl: true,
            aboutMe: true,
            education: true,
            experience: true,
            certificates: false,
            references: false,
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
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
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardData', () => {
        it('deve retornar todos os dados do dashboard agregados', async () => {
            const username = 'testuser';

            mockGetApplicationsStatsUseCase.execute.mockResolvedValue(mockApplicationsStats);
            mockGetTechnologiesStatsUseCase.execute.mockResolvedValue(mockTechnologiesStats);
            mockGetUnreadMessagesStatsUseCase.execute.mockResolvedValue(mockUnreadMessages);
            mockGetProfileCompletenessUseCase.execute.mockResolvedValue(mockProfileCompleteness);

            const result = await service.getDashboardData(username);

            expect(result).toEqual({
                applications: mockApplicationsStats,
                technologies: mockTechnologiesStats,
                unreadMessages: mockUnreadMessages,
                profileCompleteness: mockProfileCompleteness,
            });
        });

        it('deve executar todos os use-cases em paralelo', async () => {
            const username = 'testuser';

            mockGetApplicationsStatsUseCase.execute.mockResolvedValue(mockApplicationsStats);
            mockGetTechnologiesStatsUseCase.execute.mockResolvedValue(mockTechnologiesStats);
            mockGetUnreadMessagesStatsUseCase.execute.mockResolvedValue(mockUnreadMessages);
            mockGetProfileCompletenessUseCase.execute.mockResolvedValue(mockProfileCompleteness);

            await service.getDashboardData(username);

            expect(mockGetApplicationsStatsUseCase.execute).toHaveBeenCalledWith(username);
            expect(mockGetTechnologiesStatsUseCase.execute).toHaveBeenCalledWith(username);
            expect(mockGetUnreadMessagesStatsUseCase.execute).toHaveBeenCalledWith(username);
            expect(mockGetProfileCompletenessUseCase.execute).toHaveBeenCalledWith(username);
        });

        it('deve retornar estrutura correta do DashboardResponseDto', async () => {
            const username = 'testuser';

            mockGetApplicationsStatsUseCase.execute.mockResolvedValue(mockApplicationsStats);
            mockGetTechnologiesStatsUseCase.execute.mockResolvedValue(mockTechnologiesStats);
            mockGetUnreadMessagesStatsUseCase.execute.mockResolvedValue(mockUnreadMessages);
            mockGetProfileCompletenessUseCase.execute.mockResolvedValue(mockProfileCompleteness);

            const result = await service.getDashboardData(username);

            expect(result).toHaveProperty('applications');
            expect(result).toHaveProperty('technologies');
            expect(result).toHaveProperty('unreadMessages');
            expect(result).toHaveProperty('profileCompleteness');
        });
    });
});

