import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTechnologyUseCase } from './delete-technology.use-case';
import { TechnologiesService } from '../technologies.service';
import { TechnologyNotFoundException } from '../exceptions/technology-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/technology.entity', () => ({
    Technology: class Technology {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        delete: jest.fn(),
        decrementDisplayOrderAfter: jest.fn(),
    })),
}));

describe('DeleteTechnologyUseCase', () => {
    let useCase: DeleteTechnologyUseCase;
    let technologiesService: TechnologiesService;

    const mockTechnologiesService = {
        findById: jest.fn(),
        delete: jest.fn(),
        decrementDisplayOrderAfter: jest.fn(),
    };

    const mockTechnology = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        displayOrder: 3,
        expertiseLevel: 'INTERMEDIATE' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteTechnologyUseCase,
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteTechnologyUseCase>(DeleteTechnologyUseCase);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar uma tecnologia e reordenar as restantes', async () => {
            const username = 'testuser';
            const id = 1;

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.delete.mockResolvedValue(undefined);
            mockTechnologiesService.decrementDisplayOrderAfter.mockResolvedValue(undefined);

            await useCase.execute(username, id);

            expect(mockTechnologiesService.findById).toHaveBeenCalledWith(id, username);
            expect(mockTechnologiesService.delete).toHaveBeenCalledWith(id);
            expect(mockTechnologiesService.decrementDisplayOrderAfter).toHaveBeenCalledWith(
                mockTechnology.displayOrder,
                username,
            );
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockTechnologiesService.findById.mockRejectedValue(new Error('Not found'));

            await expect(useCase.execute(username, id)).rejects.toThrow(
                TechnologyNotFoundException,
            );

            expect(mockTechnologiesService.delete).not.toHaveBeenCalled();
            expect(mockTechnologiesService.decrementDisplayOrderAfter).not.toHaveBeenCalled();
        });

        it('deve usar displayOrder correto ao reordenar', async () => {
            const username = 'testuser';
            const id = 1;
            const technologyWithOrder = { ...mockTechnology, displayOrder: 5 };

            mockTechnologiesService.findById.mockResolvedValue(technologyWithOrder);
            mockTechnologiesService.delete.mockResolvedValue(undefined);
            mockTechnologiesService.decrementDisplayOrderAfter.mockResolvedValue(undefined);

            await useCase.execute(username, id);

            expect(mockTechnologiesService.decrementDisplayOrderAfter).toHaveBeenCalledWith(
                5,
                username,
            );
        });
    });
});

