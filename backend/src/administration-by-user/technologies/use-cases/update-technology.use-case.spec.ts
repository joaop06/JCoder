import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTechnologyUseCase } from './update-technology.use-case';
import { TechnologiesService } from '../technologies.service';
import { UpdateTechnologyDto } from '../dto/update-technology.dto';
import { TechnologyNotFoundException } from '../exceptions/technology-not-found.exception';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/technology.entity', () => ({
    Technology: class Technology {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        update: jest.fn(),
        existsByTechnologyNameAndUsername: jest.fn(),
    })),
}));

describe('UpdateTechnologyUseCase', () => {
    let useCase: UpdateTechnologyUseCase;
    let technologiesService: TechnologiesService;

    const mockTechnologiesService = {
        findById: jest.fn(),
        update: jest.fn(),
        existsByTechnologyNameAndUsername: jest.fn(),
    };

    const mockTechnology = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        displayOrder: 1,
        expertiseLevel: 'INTERMEDIATE' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUpdateTechnologyDto: UpdateTechnologyDto = {
        name: 'Node.js Updated',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateTechnologyUseCase,
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
            ],
        }).compile();

        useCase = module.get<UpdateTechnologyUseCase>(UpdateTechnologyUseCase);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve atualizar uma tecnologia existente', async () => {
            const id = 1;
            const username = 'testuser';
            const updatedTechnology = { ...mockTechnology, ...mockUpdateTechnologyDto };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.existsByTechnologyNameAndUsername.mockResolvedValue(null);
            mockTechnologiesService.update.mockResolvedValue(updatedTechnology);

            const result = await useCase.execute(id, username, mockUpdateTechnologyDto);

            expect(result).toEqual(updatedTechnology);
            expect(mockTechnologiesService.findById).toHaveBeenCalledWith(id, username);
            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).toHaveBeenCalledWith(
                username,
                mockUpdateTechnologyDto.name,
            );
            expect(mockTechnologiesService.update).toHaveBeenCalledWith(id, mockUpdateTechnologyDto);
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const id = 999;
            const username = 'testuser';

            mockTechnologiesService.findById.mockRejectedValue(new TechnologyNotFoundException());

            await expect(useCase.execute(id, username, mockUpdateTechnologyDto)).rejects.toThrow(
                TechnologyNotFoundException,
            );

            expect(mockTechnologiesService.update).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando nome já existe para outra tecnologia', async () => {
            const id = 1;
            const username = 'testuser';
            const existingTechnology = { ...mockTechnology, id: 2, name: 'Node.js Updated' };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.existsByTechnologyNameAndUsername.mockResolvedValue(
                existingTechnology,
            );

            await expect(useCase.execute(id, username, mockUpdateTechnologyDto)).rejects.toThrow(
                TechnologyAlreadyExistsException,
            );

            expect(mockTechnologiesService.update).not.toHaveBeenCalled();
        });

        it('não deve lançar exceção quando nome existe mas é da mesma tecnologia', async () => {
            const id = 1;
            const username = 'testuser';
            const updatedTechnology = { ...mockTechnology, ...mockUpdateTechnologyDto };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.existsByTechnologyNameAndUsername.mockResolvedValue(mockTechnology);
            mockTechnologiesService.update.mockResolvedValue(updatedTechnology);

            const result = await useCase.execute(id, username, mockUpdateTechnologyDto);

            expect(result).toEqual(updatedTechnology);
            expect(mockTechnologiesService.update).toHaveBeenCalled();
        });

        it('não deve verificar nome quando name está vazio', async () => {
            const id = 1;
            const username = 'testuser';
            const updateDtoWithoutName = { isActive: false };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.update.mockResolvedValue({ ...mockTechnology, isActive: false });

            await useCase.execute(id, username, updateDtoWithoutName);

            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).not.toHaveBeenCalled();
        });

        it('não deve verificar nome quando name é null', async () => {
            const id = 1;
            const username = 'testuser';
            const updateDtoWithoutName = { name: null as any };

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);
            mockTechnologiesService.update.mockResolvedValue(mockTechnology);

            await useCase.execute(id, username, updateDtoWithoutName);

            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).not.toHaveBeenCalled();
        });
    });
});

