import { Test, TestingModule } from '@nestjs/testing';
import { AlreadyExistsApplicationException } from '../exceptions/already-exists-application-exception';
import { CreateApplicationDto } from '../dto/create-application.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../applications.service', () => ({
    ApplicationsService: jest.fn().mockImplementation(() => ({
        existsByApplicationNameAndUsername: jest.fn(),
        incrementDisplayOrderFrom: jest.fn(),
        create: jest.fn(),
        setApplicationTechnologies: jest.fn(),
        findById: jest.fn(),
    })),
}));

jest.mock('../application-components/application-components.service', () => ({
    ApplicationComponentsService: jest.fn().mockImplementation(() => ({
        saveComponents: jest.fn(),
    })),
}));

import { CreateApplicationUseCase } from './create-application.use-case';
import { ApplicationsService } from '../applications.service';
import { UsersService } from '../../users/users.service';
import { ApplicationComponentsService } from '../application-components/application-components.service';

// Mock da entidade para evitar dependências circulares
type Application = any;

describe('CreateApplicationUseCase', () => {
    let useCase: CreateApplicationUseCase;
    let applicationsService: ApplicationsService;
    let usersService: UsersService;
    let applicationComponentsService: ApplicationComponentsService;

    const mockApplicationsService = {
        existsByApplicationNameAndUsername: jest.fn(),
        incrementDisplayOrderFrom: jest.fn(),
        create: jest.fn(),
        setApplicationTechnologies: jest.fn(),
        findById: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockApplicationComponentsService = {
        saveComponents: jest.fn(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Application;

    const mockCreateDto: CreateApplicationDto = {
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateApplicationUseCase,
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: ApplicationComponentsService,
                    useValue: mockApplicationComponentsService,
                },
            ],
        }).compile();

        useCase = module.get<CreateApplicationUseCase>(CreateApplicationUseCase);
        applicationsService = module.get<ApplicationsService>(ApplicationsService);
        usersService = module.get<UsersService>(UsersService);
        applicationComponentsService = module.get<ApplicationComponentsService>(
            ApplicationComponentsService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve criar uma nova aplicação com sucesso', async () => {
            const username = 'testuser';

            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockApplicationsService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponents.mockResolvedValue(undefined);
            mockApplicationsService.setApplicationTechnologies.mockResolvedValue(undefined);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);

            const result = await useCase.execute(username, mockCreateDto);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationsService.existsByApplicationNameAndUsername).toHaveBeenCalledWith(
                username,
                mockCreateDto.name,
            );
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockApplicationsService.incrementDisplayOrderFrom).toHaveBeenCalledWith(1, mockUser.id);
            expect(mockApplicationsService.create).toHaveBeenCalledWith({
                ...mockCreateDto,
                userId: mockUser.id,
                displayOrder: 1,
            });
            expect(mockApplicationComponentsService.saveComponents).toHaveBeenCalled();
            expect(mockApplicationsService.findById).toHaveBeenCalledWith(mockApplication.id, username);
        });

        it('deve lançar exceção quando nome já existe', async () => {
            const username = 'testuser';

            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(mockApplication);

            await expect(useCase.execute(username, mockCreateDto)).rejects.toThrow(
                AlreadyExistsApplicationException,
            );
            expect(mockUsersService.findOneBy).not.toHaveBeenCalled();
            expect(mockApplicationsService.create).not.toHaveBeenCalled();
        });

        it('deve associar tecnologias quando fornecidas', async () => {
            const username = 'testuser';
            const createDtoWithTechs: CreateApplicationDto = {
                ...mockCreateDto,
                technologyIds: [1, 2, 3],
            };

            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockApplicationsService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponents.mockResolvedValue(undefined);
            mockApplicationsService.setApplicationTechnologies.mockResolvedValue(undefined);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);

            await useCase.execute(username, createDtoWithTechs);

            expect(mockApplicationsService.setApplicationTechnologies).toHaveBeenCalledWith(
                mockApplication.id,
                [1, 2, 3],
            );
        });

        it('não deve associar tecnologias quando não fornecidas', async () => {
            const username = 'testuser';

            mockApplicationsService.existsByApplicationNameAndUsername.mockResolvedValue(null);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockApplicationsService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockApplicationsService.create.mockResolvedValue(mockApplication);
            mockApplicationComponentsService.saveComponents.mockResolvedValue(undefined);
            mockApplicationsService.findById.mockResolvedValue(mockApplication);

            await useCase.execute(username, mockCreateDto);

            expect(mockApplicationsService.setApplicationTechnologies).not.toHaveBeenCalled();
        });
    });
});

