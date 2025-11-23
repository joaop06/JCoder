import { Test, TestingModule } from '@nestjs/testing';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
    })),
}));

jest.mock('../application-components/application-components.service', () => ({
    ApplicationComponentsService: jest.fn().mockImplementation(() => ({
        deleteComponent: jest.fn(),
    })),
}));

import { DeleteApplicationComponentUseCase } from './delete-application-component.use-case';
import { ApplicationsService } from '../applications.service';
import { ApplicationComponentsService } from '../application-components/application-components.service';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('DeleteApplicationComponentUseCase', () => {
    let useCase: DeleteApplicationComponentUseCase;
    let applicationsService: ApplicationsService;
    let applicationComponentsService: ApplicationComponentsService;

    const mockApplicationsService = {
        findById: jest.fn(),
    };

    const mockApplicationComponentsService = {
        deleteComponent: jest.fn(),
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
            providers: [
                DeleteApplicationComponentUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
                {
                    provide: ApplicationComponentsService,
                    useValue: mockApplicationComponentsService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteApplicationComponentUseCase>(DeleteApplicationComponentUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        applicationComponentsService = module.get<ApplicationComponentsService>(
            ApplicationComponentsService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar componente API com sucesso', async () => {
            const username = 'testuser';
            const applicationId = 1;
            const componentType = 'api' as const;

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationComponentsService.deleteComponent.mockResolvedValue(undefined);

            const result = await useCase.execute(username, applicationId, componentType);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(applicationId, username);
            expect(mockApplicationComponentsService.deleteComponent).toHaveBeenCalledWith(
                applicationId,
                componentType,
            );
            expect(mockApplicationsService.findById).toHaveBeenCalledTimes(2);
        });

        it('deve deletar componente Mobile com sucesso', async () => {
            const username = 'testuser';
            const applicationId = 1;
            const componentType = 'mobile' as const;

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationComponentsService.deleteComponent.mockResolvedValue(undefined);

            const result = await useCase.execute(username, applicationId, componentType);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.deleteComponent).toHaveBeenCalledWith(
                applicationId,
                componentType,
            );
        });

        it('deve deletar componente Library com sucesso', async () => {
            const username = 'testuser';
            const applicationId = 1;
            const componentType = 'library' as const;

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationComponentsService.deleteComponent.mockResolvedValue(undefined);

            const result = await useCase.execute(username, applicationId, componentType);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.deleteComponent).toHaveBeenCalledWith(
                applicationId,
                componentType,
            );
        });

        it('deve deletar componente Frontend com sucesso', async () => {
            const username = 'testuser';
            const applicationId = 1;
            const componentType = 'frontend' as const;

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationComponentsService.deleteComponent.mockResolvedValue(undefined);

            const result = await useCase.execute(username, applicationId, componentType);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationComponentsService.deleteComponent).toHaveBeenCalledWith(
                applicationId,
                componentType,
            );
        });

        it('deve lançar exceção quando aplicação não encontrada', async () => {
            const username = 'testuser';
            const applicationId = 999;
            const componentType = 'api' as const;

            mockApplicationsService.findById.mockRejectedValue(new Error('Not found'));

            await expect(
                useCase.execute(username, applicationId, componentType),
            ).rejects.toThrow('Not found');
            expect(mockApplicationComponentsService.deleteComponent).not.toHaveBeenCalled();
        });
    });
});

