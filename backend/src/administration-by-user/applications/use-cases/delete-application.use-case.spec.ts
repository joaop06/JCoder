import { Test, TestingModule } from '@nestjs/testing';
import { AlreadyDeletedApplicationException } from '../exceptions/already-deleted-application.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        delete: jest.fn(),
        decrementDisplayOrderAfter: jest.fn(),
    })),
}));

import { DeleteApplicationUseCase } from './delete-application.use-case';
import { ApplicationsService } from '../applications.service';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('DeleteApplicationUseCase', () => {
    let useCase: DeleteApplicationUseCase;
    let applicationsService: ApplicationsService;

    const mockApplicationsService = {
        findById: jest.fn(),
        delete: jest.fn(),
        decrementDisplayOrderAfter: jest.fn(),
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
                DeleteApplicationUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteApplicationUseCase>(DeleteApplicationUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar uma aplicação com sucesso', async () => {
            const username = 'testuser';
            const id = 1;

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.delete.mockResolvedValue(undefined);
            mockApplicationsService.decrementDisplayOrderAfter.mockResolvedValue(undefined);

            await useCase.execute(username, id);

            expect(mockApplicationsService.findById).toHaveBeenCalledWith(id, username);
            expect(mockApplicationsService.delete).toHaveBeenCalledWith(id);
            expect(mockApplicationsService.decrementDisplayOrderAfter).toHaveBeenCalledWith(
                mockApplication.displayOrder,
                username,
            );
        });

        it('deve lançar exceção quando aplicação não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockApplicationsService.findById.mockRejectedValue(new Error('Not found'));

            await expect(useCase.execute(username, id)).rejects.toThrow(AlreadyDeletedApplicationException);
            expect(mockApplicationsService.delete).not.toHaveBeenCalled();
            expect(mockApplicationsService.decrementDisplayOrderAfter).not.toHaveBeenCalled();
        });

        it('deve usar displayOrder correto ao reordenar', async () => {
            const username = 'testuser';
            const id = 1;
            const applicationWithOrder = { ...mockApplication, displayOrder: 5 };

            mockApplicationsService.findById.mockResolvedValue(applicationWithOrder);
            mockApplicationsService.delete.mockResolvedValue(undefined);
            mockApplicationsService.decrementDisplayOrderAfter.mockResolvedValue(undefined);

            await useCase.execute(username, id);

            expect(mockApplicationsService.decrementDisplayOrderAfter).toHaveBeenCalledWith(5, username);
        });
    });
});

