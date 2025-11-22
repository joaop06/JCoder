import { Test, TestingModule } from '@nestjs/testing';
import { ReorderTechnologyUseCase } from './reorder-technology.use-case';
import { TechnologiesService } from '../technologies.service';
import { ReorderTechnologyDto } from '../dto/reorder-technology.dto';
import { TechnologyNotFoundException } from '../exceptions/technology-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/technology.entity', () => ({
    Technology: class Technology {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        reorderOnUpdate: jest.fn(),
        update: jest.fn(),
    })),
}));

describe('ReorderTechnologyUseCase', () => {
    let useCase: ReorderTechnologyUseCase;
    let technologiesService: TechnologiesService;

    const mockTechnologiesService = {
        findById: jest.fn(),
        reorderOnUpdate: jest.fn(),
        update: jest.fn(),
    };

    const mockTechnology = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        displayOrder: 2,
        expertiseLevel: 'INTERMEDIATE' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockReorderTechnologyDto: ReorderTechnologyDto = {
        displayOrder: 5,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReorderTechnologyUseCase,
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
            ],
        }).compile();

        useCase = module.get<ReorderTechnologyUseCase>(ReorderTechnologyUseCase);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve reordenar uma tecnologia', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderedTechnology = { ...mockTechnology, displayOrder: 5 };

            mockTechnologiesService.findById
                .mockResolvedValueOnce(mockTechnology)
                .mockResolvedValueOnce(reorderedTechnology);
            mockTechnologiesService.reorderOnUpdate.mockResolvedValue(undefined);
            mockTechnologiesService.update.mockResolvedValue(reorderedTechnology);

            const result = await useCase.execute(username, id, mockReorderTechnologyDto);

            expect(result).toEqual(reorderedTechnology);
            expect(mockTechnologiesService.findById).toHaveBeenCalledWith(id, username);
            expect(mockTechnologiesService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                mockTechnology.displayOrder,
                mockReorderTechnologyDto.displayOrder,
                username,
            );
            expect(mockTechnologiesService.update).toHaveBeenCalledWith(id, {
                displayOrder: mockReorderTechnologyDto.displayOrder,
            });
            expect(mockTechnologiesService.findById).toHaveBeenCalledTimes(2);
        });

        it('deve retornar tecnologia sem alterações quando displayOrder é o mesmo', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDtoSameOrder: ReorderTechnologyDto = {
                displayOrder: mockTechnology.displayOrder,
            };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);

            const result = await useCase.execute(username, id, reorderDtoSameOrder);

            expect(result).toEqual(mockTechnology);
            expect(mockTechnologiesService.reorderOnUpdate).not.toHaveBeenCalled();
            expect(mockTechnologiesService.update).not.toHaveBeenCalled();
            expect(mockTechnologiesService.findById).toHaveBeenCalledTimes(1);
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockTechnologiesService.findById.mockRejectedValue(
                new TechnologyNotFoundException(),
            );

            await expect(useCase.execute(username, id, mockReorderTechnologyDto)).rejects.toThrow(
                TechnologyNotFoundException,
            );

            expect(mockTechnologiesService.reorderOnUpdate).not.toHaveBeenCalled();
            expect(mockTechnologiesService.update).not.toHaveBeenCalled();
        });

        it('deve mover tecnologia para posição maior', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderTechnologyDto = { displayOrder: 10 };
            const reorderedTechnology = { ...mockTechnology, displayOrder: 10 };

            mockTechnologiesService.findById
                .mockResolvedValueOnce(mockTechnology)
                .mockResolvedValueOnce(reorderedTechnology);
            mockTechnologiesService.reorderOnUpdate.mockResolvedValue(undefined);
            mockTechnologiesService.update.mockResolvedValue(reorderedTechnology);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result.displayOrder).toBe(10);
            expect(mockTechnologiesService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                2,
                10,
                username,
            );
        });

        it('deve mover tecnologia para posição menor', async () => {
            const username = 'testuser';
            const id = 1;
            const technologyAtPosition5 = { ...mockTechnology, displayOrder: 5 };
            const reorderDto: ReorderTechnologyDto = { displayOrder: 1 };
            const reorderedTechnology = { ...mockTechnology, displayOrder: 1 };

            mockTechnologiesService.findById
                .mockResolvedValueOnce(technologyAtPosition5)
                .mockResolvedValueOnce(reorderedTechnology);
            mockTechnologiesService.reorderOnUpdate.mockResolvedValue(undefined);
            mockTechnologiesService.update.mockResolvedValue(reorderedTechnology);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result.displayOrder).toBe(1);
            expect(mockTechnologiesService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                5,
                1,
                username,
            );
        });
    });
});

