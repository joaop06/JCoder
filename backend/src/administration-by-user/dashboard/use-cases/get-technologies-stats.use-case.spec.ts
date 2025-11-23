import { Test, TestingModule } from '@nestjs/testing';
import { GetTechnologiesStatsUseCase } from './get-technologies-stats.use-case';
import { TechnologiesService } from '../../technologies/technologies.service';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock do serviço antes de importar
jest.mock('../../technologies/technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        getStats: jest.fn(),
    })),
}));

describe('GetTechnologiesStatsUseCase', () => {
    let useCase: GetTechnologiesStatsUseCase;
    let technologiesService: TechnologiesService;

    const mockTechnologiesService = {
        getStats: jest.fn(),
    };

    const mockStats = {
        total: 5,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetTechnologiesStatsUseCase,
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
            ],
        }).compile();

        useCase = module.get<GetTechnologiesStatsUseCase>(GetTechnologiesStatsUseCase);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar estatísticas de tecnologias', async () => {
            const username = 'testuser';

            mockTechnologiesService.getStats.mockResolvedValue(mockStats);

            const result = await useCase.execute(username);

            expect(result).toEqual(mockStats);
            expect(mockTechnologiesService.getStats).toHaveBeenCalledWith(username);
        });
    });
});

