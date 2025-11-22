import { Test, TestingModule } from '@nestjs/testing';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ReorderApplicationDto } from './dto/reorder-application.dto';
import { ApplicationsStatsDto } from './dto/applications-stats.dto';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('./entities/application.entity', () => ({
    Application: class Application {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('./applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        findAll: jest.fn(),
        findById: jest.fn(),
        getStats: jest.fn(),
    })),
}));

jest.mock('./use-cases/create-application.use-case', () => ({
    CreateApplicationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/update-application.use-case', () => ({
    UpdateApplicationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/delete-application.use-case', () => ({
    DeleteApplicationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/reorder-application.use-case', () => ({
    ReorderApplicationUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

jest.mock('./use-cases/delete-application-component.use-case', () => ({
    DeleteApplicationComponentUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { ReorderApplicationUseCase } from './use-cases/reorder-application.use-case';
import { DeleteApplicationComponentUseCase } from './use-cases/delete-application-component.use-case';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('ApplicationsController', () => {
    let controller: ApplicationsController;
    let applicationsService: ApplicationsService;
    let createApplicationUseCase: CreateApplicationUseCase;
    let updateApplicationUseCase: UpdateApplicationUseCase;
    let deleteApplicationUseCase: DeleteApplicationUseCase;
    let reorderApplicationUseCase: ReorderApplicationUseCase;
    let deleteApplicationComponentUseCase: DeleteApplicationComponentUseCase;

    const mockApplicationsService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        getStats: jest.fn(),
    };

    const mockCreateApplicationUseCase = {
        execute: jest.fn(),
    };

    const mockUpdateApplicationUseCase = {
        execute: jest.fn(),
    };

    const mockDeleteApplicationUseCase = {
        execute: jest.fn(),
    };

    const mockReorderApplicationUseCase = {
        execute: jest.fn(),
    };

    const mockDeleteApplicationComponentUseCase = {
        execute: jest.fn(),
    };

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Application;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationsController],
            providers: [
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
                {
                    provide: CreateApplicationUseCase,
                    useValue: mockCreateApplicationUseCase,
                },
                {
                    provide: UpdateApplicationUseCase,
                    useValue: mockUpdateApplicationUseCase,
                },
                {
                    provide: DeleteApplicationUseCase,
                    useValue: mockDeleteApplicationUseCase,
                },
                {
                    provide: ReorderApplicationUseCase,
                    useValue: mockReorderApplicationUseCase,
                },
                {
                    provide: DeleteApplicationComponentUseCase,
                    useValue: mockDeleteApplicationComponentUseCase,
                },
            ],
        }).compile();

        controller = module.get<ApplicationsController>(ApplicationsController);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        createApplicationUseCase = module.get<CreateApplicationUseCase>(CreateApplicationUseCase);
        updateApplicationUseCase = module.get<UpdateApplicationUseCase>(UpdateApplicationUseCase);
        deleteApplicationUseCase = module.get<DeleteApplicationUseCase>(DeleteApplicationUseCase);
        reorderApplicationUseCase = module.get<ReorderApplicationUseCase>(ReorderApplicationUseCase);
        deleteApplicationComponentUseCase = module.get<DeleteApplicationComponentUseCase>(
            DeleteApplicationComponentUseCase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('deve retornar lista paginada de aplicações', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockResponse: PaginatedResponseDto<Application> = {
                data: [mockApplication],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockApplicationsService.findAll.mockResolvedValue(mockResponse);

            const result = await controller.findAll(username, paginationDto);

            expect(result).toEqual(mockResponse);
            expect(mockApplicationsService.findAll).toHaveBeenCalledWith(username, paginationDto);
        });
    });

    describe('getStats', () => {
        it('deve retornar estatísticas de aplicações', async () => {
            const username = 'testuser';
            const mockStats: ApplicationsStatsDto = {
                total: 10,
                active: 7,
                inactive: 3,
            };

            mockApplicationsService.getStats.mockResolvedValue(mockStats);

            const result = await controller.getStats(username);

            expect(result).toEqual(mockStats);
            expect(mockApplicationsService.getStats).toHaveBeenCalledWith(username);
        });
    });

    describe('findById', () => {
        it('deve retornar uma aplicação por ID', async () => {
            const username = 'testuser';
            const id = 1;

            mockApplicationsService.findById.mockResolvedValue(mockApplication);

            const result = await controller.findById(username, id);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(id, username);
        });
    });

    describe('create', () => {
        it('deve criar uma nova aplicação', async () => {
            const username = 'testuser';
            const createDto: CreateApplicationDto = {
                userId: 1,
                name: 'New Application',
                description: 'New Description',
            };

            mockCreateApplicationUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.create(username, createDto);

            expect(result).toEqual(mockApplication);
            expect(mockCreateApplicationUseCase.execute).toHaveBeenCalledWith(username, createDto);
        });
    });

    describe('update', () => {
        it('deve atualizar uma aplicação existente', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
            };
            const updatedApplication = { ...mockApplication, ...updateDto };

            mockUpdateApplicationUseCase.execute.mockResolvedValue(updatedApplication);

            const result = await controller.update(username, id, updateDto);

            expect(result).toEqual(updatedApplication);
            expect(mockUpdateApplicationUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                updateDto,
            );
        });
    });

    describe('delete', () => {
        it('deve deletar uma aplicação', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteApplicationUseCase.execute.mockResolvedValue(undefined);

            await controller.delete(username, id);

            expect(mockDeleteApplicationUseCase.execute).toHaveBeenCalledWith(username, id);
        });
    });

    describe('reorder', () => {
        it('deve reordenar uma aplicação', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderApplicationDto = { displayOrder: 5 };
            const reorderedApplication = { ...mockApplication, displayOrder: 5 };

            mockReorderApplicationUseCase.execute.mockResolvedValue(reorderedApplication);

            const result = await controller.reorder(username, id, reorderDto);

            expect(result).toEqual(reorderedApplication);
            expect(mockReorderApplicationUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                reorderDto,
            );
        });
    });

    describe('deleteApiComponent', () => {
        it('deve deletar componente API', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteApplicationComponentUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.deleteApiComponent(username, id);

            expect(result).toEqual(mockApplication);
            expect(mockDeleteApplicationComponentUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                'api',
            );
        });
    });

    describe('deleteMobileComponent', () => {
        it('deve deletar componente Mobile', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteApplicationComponentUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.deleteMobileComponent(username, id);

            expect(result).toEqual(mockApplication);
            expect(mockDeleteApplicationComponentUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                'mobile',
            );
        });
    });

    describe('deleteLibraryComponent', () => {
        it('deve deletar componente Library', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteApplicationComponentUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.deleteLibraryComponent(username, id);

            expect(result).toEqual(mockApplication);
            expect(mockDeleteApplicationComponentUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                'library',
            );
        });
    });

    describe('deleteFrontendComponent', () => {
        it('deve deletar componente Frontend', async () => {
            const username = 'testuser';
            const id = 1;

            mockDeleteApplicationComponentUseCase.execute.mockResolvedValue(mockApplication);

            const result = await controller.deleteFrontendComponent(username, id);

            expect(result).toEqual(mockApplication);
            expect(mockDeleteApplicationComponentUseCase.execute).toHaveBeenCalledWith(
                username,
                id,
                'frontend',
            );
        });
    });
});

