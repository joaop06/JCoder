import { Test, TestingModule } from '@nestjs/testing';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';
import { UpdateApplicationDto } from '../dto/update-application.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        existsByApplicationNameAndUsername: jest.fn(),
        update: jest.fn(),
        setApplicationTechnologies: jest.fn(),
    })),
}));

jest.mock('../application-components/application-components.service', () => ({
    ApplicationComponentsService: jest.fn().mockImplementation(() => ({
        updateComponents: jest.fn(),
    })),
}));

import { UpdateApplicationUseCase } from './update-application.use-case';
import { ApplicationsService } from '../applications.service';
import { ApplicationComponentsService } from '../application-components/application-components.service';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('UpdateApplicationUseCase', () => {
    let useCase: UpdateApplicationUseCase;
    let applicationsService: ApplicationsService;
    let applicationComponentsService: ApplicationComponentsService;

    const mockApplicationsService = {
        findById: jest.fn(),
        existsByApplicationNameAndUsername: jest.fn(),
        update: jest.fn(),
        setApplicationTechnologies: jest.fn(),
    };

    const mockApplicationComponentsService = {
        updateComponents: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
    };

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        isActive: true,
        displayOrder: 1,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Application;

    const mockUpdateDto: UpdateApplicationDto = {
        name: 'Updated Application',
        description: 'Updated Description',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateApplicationUseCase,
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

        useCase = module.get<UpdateApplicationUseCase>(UpdateApplicationUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        applicationComponentsService = module.get<ApplicationComponentsService>(
            ApplicationComponentsService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve atualizar uma aplicação com sucesso', async () => {
            const username = 'testuser';
            const id = 1;
            const updatedApplication = { ...mockApplication, ...mockUpdateDto };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(updatedApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(updatedApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);

            const result = await useCase.execute(username, id, mockUpdateDto);

            expect(result).toEqual(updatedApplication);
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(id, username);
            expect(mockApplicationsService.update).toHaveBeenCalledWith(id, mockUpdateDto);
            expect(mockApplicationComponentsService.updateComponents).toHaveBeenCalled();
        });

        it('deve lançar exceção quando nome já existe para outro usuário', async () => {
            const username = 'testuser';
            const id = 1;
            const existingApplication = { ...mockApplication, id: 999 };

            mockApplicationsService.findById.mockResolvedValue(mockApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(
                existingApplication,
            );

            await expect(useCase.execute(username, id, mockUpdateDto)).rejects.toThrow(
                AlreadyExistsApplicationException,
            );
            expect(mockApplicationsService.update).not.toHaveBeenCalled();
        });

        it('não deve lançar exceção quando nome é o mesmo da aplicação atual', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Test Application', // mesmo nome
            };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);

            const result = await useCase.execute(username, id, updateDto);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.update).toHaveBeenCalled();
        });

        it('deve atualizar tecnologias quando fornecidas', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDtoWithTechs: UpdateApplicationDto = {
                ...mockUpdateDto,
                technologyIds: [1, 2, 3],
            };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);
            mockApplicationsService.setApplicationTechnologies.mockResolvedValue(undefined);

            await useCase.execute(username, id, updateDtoWithTechs);

            expect(mockApplicationsService.setApplicationTechnologies).toHaveBeenCalledWith(id, [1, 2, 3]);
        });

        it('não deve atualizar tecnologias quando não fornecidas', async () => {
            const username = 'testuser';
            const id = 1;

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);

            await useCase.execute(username, id, mockUpdateDto);

            expect(mockApplicationsService.setApplicationTechnologies).not.toHaveBeenCalled();
        });

        it('deve atualizar tecnologias quando array vazio é fornecido', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDtoWithEmptyTechs: UpdateApplicationDto = {
                ...mockUpdateDto,
                technologyIds: [],
            };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);
            mockApplicationsService.setApplicationTechnologies.mockResolvedValue(undefined);

            await useCase.execute(username, id, updateDtoWithEmptyTechs);

            expect(mockApplicationsService.setApplicationTechnologies).toHaveBeenCalledWith(id, []);
        });

        it('não deve verificar nome quando não fornecido no DTO', async () => {
            const username = 'testuser';
            const id = 1;
            const updateDtoWithoutName: UpdateApplicationDto = {
                description: 'Updated Description',
            };

            mockApplicationsService.findById
                .mockResolvedValueOnce(mockApplication)
                .mockResolvedValueOnce(mockApplication);
            mockApplicationsService.update.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.updateComponents.mockResolvedValue(undefined);

            await useCase.execute(username, id, updateDtoWithoutName);

            expect(mockApplicationsService.existsByApplicationNameAndUsername).not.toHaveBeenCalled();
        });
    });
});

