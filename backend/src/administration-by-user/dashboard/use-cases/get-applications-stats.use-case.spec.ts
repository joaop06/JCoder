import { Test, TestingModule } from '@nestjs/testing';
import { GetApplicationsStatsUseCase } from './get-applications-stats.use-case';
import { ApplicationsService } from '../../applications/applications.service';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock do serviço antes de importar
jest.mock('../../applications/applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        getStats: jest.fn(),
    })),
}));

describe('GetApplicationsStatsUseCase', () => {
    let useCase: GetApplicationsStatsUseCase;
    let applicationsService: ApplicationsService;

    const mockApplicationsService = {
        getStats: jest.fn(),
    };

    const mockStats = {
        total: 10,
        active: 7,
        inactive: 3,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetApplicationsStatsUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
            ],
        }).compile();

        useCase = module.get<GetApplicationsStatsUseCase>(GetApplicationsStatsUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar estatísticas de aplicações', async () => {
            const username = 'testuser';

            mockApplicationsService.getStats.mockResolvedValue(mockStats);

            const result = await useCase.execute(username);

            expect(result).toEqual(mockStats);
            expect(mockApplicationsService.getStats).toHaveBeenCalledWith(username);
        });
    });
});

