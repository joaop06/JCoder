import { Test, TestingModule } from '@nestjs/testing';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { ReorderTechnologyUseCase } from './use-cases/reorder-technology.use-case';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { ReorderTechnologyDto } from './dto/reorder-technology.dto';
import { TechnologiesStatsDto } from './dto/technologies-stats.dto';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';
import { TechnologyAlreadyExistsException } from './exceptions/technology-already-exists.exception';
import { TechnologyAlreadyDeletedException } from './exceptions/technology-already-deleted.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('./entities/technology.entity', () => ({
    Technology: class Technology {},
}));

jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../applications/entities/application.entity', () => ({
    Application: class Application {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('./technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        findAll: jest.fn(),
        findById: jest.fn(),
        getStats: jest.fn(),
    })),
}));

jest.mock('./use-cases/create-technology.use-case', () => ({
    CreateTechnologyUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/update-technology.use-case', () => ({
    UpdateTechnologyUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/delete-technology.use-case', () => ({
    DeleteTechnologyUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/reorder-technology.use-case', () => ({
    ReorderTechnologyUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

import { Technology } from './entities/technology.entity';

describe('TechnologiesController', () => {
    let controller: TechnologiesController;
    let technologiesService: TechnologiesService;
    let createTechnologyUseCase: CreateTechnologyUseCase;
    let updateTechnologyUseCase: UpdateTechnologyUseCase;
    let deleteTechnologyUseCase: DeleteTechnologyUseCase;
    let reorderTechnologyUseCase: ReorderTechnologyUseCase;

    const mockTechnologiesService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        getStats: jest.fn(),
    };

    const mockCreateTechnologyUseCase = {
        execute: jest.fn(),
    };

    const mockUpdateTechnologyUseCase = {
        execute: jest.fn(),
    };

    const mockDeleteTechnologyUseCase = {
        execute: jest.fn(),
    };

    const mockReorderTechnologyUseCase = {
        execute: jest.fn(),
    };

    const mockTechnology: Technology = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        profileImage: null,
        displayOrder: 1,
        expertiseLevel: 'INTERMEDIATE' as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    } as Technology;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TechnologiesController],
            providers: [
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
                {
                    provide: CreateTechnologyUseCase,
                    useValue: mockCreateTechnologyUseCase,
                },
                {
                    provide: UpdateTechnologyUseCase,
                    useValue: mockUpdateTechnologyUseCase,
                },
                {
                    provide: DeleteTechnologyUseCase,
                    useValue: mockDeleteTechnologyUseCase,
                },
                {
                    provide: ReorderTechnologyUseCase,
                    useValue: mockReorderTechnologyUseCase,
                },
            ],
        }).compile();

        controller = module.get<TechnologiesController>(TechnologiesController);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
        createTechnologyUseCase = module.get<CreateTechnologyUseCase>(CreateTechnologyUseCase);
        updateTechnologyUseCase = module.get<UpdateTechnologyUseCase>(UpdateTechnologyUseCase);
        deleteTechnologyUseCase = module.get<DeleteTechnologyUseCase>(DeleteTechnologyUseCase);
        reorderTechnologyUseCase = module.get<ReorderTechnologyUseCase>(ReorderTechnologyUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('deve retornar lista paginada de tecnologias', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<Technology> = {
                data: [mockTechnology],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockTechnologiesService.findAll.mockResolvedValue(mockResponse);

            const result = await controller.findAll(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockTechnologiesService.findAll).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getStats', () => {
        it('deve retornar estatísticas de tecnologias', async () => {
            const username = 'testuser';
            const mockStats: TechnologiesStatsDto = {
                total: 10,
                active: 7,
                inactive: 3,
            };

            mockTechnologiesService.getStats.mockResolvedValue(mockStats);

            const result = await controller.getStats(username);

            expect(result).toEqual(mockStats);
            expect(mockTechnologiesService.getStats).toHaveBeenCalledWith(username);
        });
    });

    describe('findById', () => {
        it('deve retornar uma tecnologia por ID', async () => {
            const username = 'testuser';
            const id = 1;

            mockTechnologiesService.findById.mockResolvedValue(mockTechnology);

            const result = await controller.findById(username, id);

            expect(result).toEqual(mockTechnology);
            expect(mockTechnologiesService.findById).toHaveBeenCalledWith(id, username);
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockTechnologiesService.findById.mockRejectedValue(
                new TechnologyNotFoundException(),
            );

            await expect(controller.findById(username, id)).rejects.toThrow(
                TechnologyNotFoundException,
            );
        });
    });

    describe('create', () => {
        it('deve criar uma nova tecnologia', async () => {
            const username = 'testuser';
            const createDto: CreateTechnologyDto = {
                name: 'React',
                expertiseLevel: 'ADVANCED' as any,
            };

            mockCreateTechnologyUseCase.execute.mockResolvedValue(mockTechnology);

            const result = await controller.create(username, createDto);

            expect(result).toEqual(mockTechnology);
            expect(mockCreateTechnologyUseCase.execute).toHaveBeenCalledWith(username, createDto);
        });

        it('deve lançar exceção quando tecnologia já existe', async () => {
            const username = 'testuser';
            const createDto: CreateTechnologyDto = {
                name: 'Node.js',
            };

            mockCreateTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyAlreadyExistsException(),
            );

            await expect(controller.create(username, createDto)).rejects.toThrow(
                TechnologyAlreadyExistsException,
            );
        });
    });

    describe('update', () => {
        it('deve atualizar uma tecnologia existente', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDto: UpdateTechnologyDto = {
                name: 'Node.js Updated',
            };
            const updatedTechnology = { ...mockTechnology, ...updateDto };

            mockUpdateTechnologyUseCase.execute.mockResolvedValue(updatedTechnology);

            const result = await controller.update(username, id, updateDto);

            expect(result).toEqual(updatedTechnology);
            expect(mockUpdateTechnologyUseCase.execute).toHaveBeenCalledWith(
                id,
                username,
                updateDto,
            );
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;
            const updateDto: UpdateTechnologyDto = {
                name: 'Updated Name',
            };

            mockUpdateTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyNotFoundException(),
            );

            await expect(controller.update(username, id, updateDto)).rejects.toThrow(
                TechnologyNotFoundException,
            );
        });

        it('deve lançar exceção quando nome já existe', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDto: UpdateTechnologyDto = {
                name: 'Existing Name',
            };

            mockUpdateTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyAlreadyExistsException(),
            );

            await expect(controller.update(username, id, updateDto)).rejects.toThrow(
                TechnologyAlreadyExistsException,
            );
        });
    });

    describe('delete', () => {
        it('deve deletar uma tecnologia', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteTechnologyUseCase.execute.mockResolvedValue(undefined);

            await controller.delete(username, id);

            expect(mockDeleteTechnologyUseCase.execute).toHaveBeenCalledWith(username, id);
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockDeleteTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyNotFoundException(),
            );

            await expect(controller.delete(username, id)).rejects.toThrow(
                TechnologyNotFoundException,
            );
        });

        it('deve lançar exceção quando tecnologia já foi deletada', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyAlreadyDeletedException(),
            );

            await expect(controller.delete(username, id)).rejects.toThrow(
                TechnologyAlreadyDeletedException,
            );
        });
    });

    describe('reorder', () => {
        it('deve reordenar uma tecnologia', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderTechnologyDto = { displayOrder: 5 };
            const reorderedTechnology = { ...mockTechnology, displayOrder: 5 };

            mockReorderTechnologyUseCase.execute.mockResolvedValue(reorderedTechnology);

            const result = await controller.reorder(username, id, reorderDto);

            expect(result).toEqual(reorderedTechnology);
            expect(mockReorderTechnologyUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                reorderDto,
            );
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const username = 'testuser';
            const id = 999;
            const reorderDto: ReorderTechnologyDto = { displayOrder: 5 };

            mockReorderTechnologyUseCase.execute.mockRejectedValue(
                new TechnologyNotFoundException(),
            );

            await expect(controller.reorder(username, id, reorderDto)).rejects.toThrow(
                TechnologyNotFoundException,
            );
        });
    });
});

