import { Test, TestingModule } from '@nestjs/testing';
import { ReorderApplicationDto } from '../dto/reorder-application.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        reorderOnUpdate: jest.fn(),
        update: jest.fn(),
    })),
}));

jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

import { ReorderApplicationUseCase } from './reorder-application.use-case';
import { ApplicationsService } from '../applications.service';
import { UsersService } from '../../users/users.service';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('ReorderApplicationUseCase', () => {
    let useCase: ReorderApplicationUseCase;
    let applicationsService: ApplicationsService;
    let usersService: UsersService;

    const mockApplicationsService = {
        findById: jest.fn(),
        reorderOnUpdate: jest.fn(),
        update: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        isActive: true,
        displayOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Application;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReorderApplicationUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        useCase = module.get<ReorderApplicationUseCase>(ReorderApplicationUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve reordenar uma aplicação com sucesso', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderApplicationDto = { displayOrder: 5 };
            const reorderedApplication = { ...mockApplication, displayOrder: 5 };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(reorderedApplication);
            mockApplicationsService.reorderOnUpdate.mockResolvedValue(undefined);
            mockApplicationsService.update.mockResolvedValue(reorderedApplication);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result).toEqual(reorderedApplication);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(id, username);
            expect(mockApplicationsService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                mockApplication.displayOrder,
                reorderDto.displayOrder,
                username,
            );
            expect(mockApplicationsService.update).toHaveBeenCalledWith(id, {
                displayOrder: reorderDto.displayOrder,
            });
        });

        it('deve retornar aplicação sem alterações quando displayOrder é o mesmo', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderApplicationDto = { displayOrder: 3 }; // mesmo valor

            mockApplicationsService.findById.mockResolvedValue(mockApplication);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.reorderOnUpdate).not.toHaveBeenCalled();
            expect(mockApplicationsService.update).not.toHaveBeenCalled();
        });

        it('deve mover aplicação para posição maior', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderApplicationDto = { displayOrder: 10 };
            const reorderedApplication = { ...mockApplication, displayOrder: 10 };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(reorderedApplication);
            mockApplicationsService.reorderOnUpdate.mockResolvedValue(undefined);
            mockApplicationsService.update.mockResolvedValue(reorderedApplication);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result.displayOrder).toBe(10);
            expect(mockApplicationsService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                3,
                10,
                username,
            );
        });

        it('deve mover aplicação para posição menor', async () => {
            const username = 'testuser';
            const id = 1;
            const reorderDto: ReorderApplicationDto = { displayOrder: 1 };
            const reorderedApplication = { ...mockApplication, displayOrder: 1 };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(reorderedApplication);
            mockApplicationsService.reorderOnUpdate.mockResolvedValue(undefined);
            mockApplicationsService.update.mockResolvedValue(reorderedApplication);

            const result = await useCase.execute(username, id, reorderDto);

            expect(result.displayOrder).toBe(1);
            expect(mockApplicationsService.reorderOnUpdate).toHaveBeenCalledWith(
                id,
                3,
                1,
                username,
            );
        });
    });
});

