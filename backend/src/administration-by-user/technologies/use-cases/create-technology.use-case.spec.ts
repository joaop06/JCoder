import { Test, TestingModule } from '@nestjs/testing';
import { CreateTechnologyUseCase } from './create-technology.use-case';
import { TechnologiesService } from '../technologies.service';
import { UsersService } from '../../users/users.service';
import { CreateTechnologyDto } from '../dto/create-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../entities/technology.entity', () => ({
    Technology: class Technology {},
}));

jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../technologies.service', () => ({
    TechnologiesService: jest.fn().mockImplementation(() => ({
        incrementDisplayOrderFrom: jest.fn(),
        create: jest.fn(),
        existsByTechnologyNameAndUsername: jest.fn(),
    })),
}));

jest.mock('../../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

describe('CreateTechnologyUseCase', () => {
    let useCase: CreateTechnologyUseCase;
    let technologiesService: TechnologiesService;
    let usersService: UsersService;

    const mockTechnologiesService = {
        incrementDisplayOrderFrom: jest.fn(),
        create: jest.fn(),
        existsByTechnologyNameAndUsername: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
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

    const mockCreateTechnologyDto: CreateTechnologyDto = {
        name: 'Node.js',
        expertiseLevel: 'INTERMEDIATE' as any,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTechnologyUseCase,
                {
                    provide: TechnologiesService,
                    useValue: mockTechnologiesService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        useCase = module.get<CreateTechnologyUseCase>(CreateTechnologyUseCase);
        technologiesService = module.get<TechnologiesService>(TechnologiesService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve criar uma nova tecnologia', async () => {
            const username = 'testuser';

            mockTechnologiesService.existsByTechnologyNameAndUsername.mockResolvedValue(null);
            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockTechnologiesService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockTechnologiesService.create.mockResolvedValue(mockTechnology);

            const result = await useCase.execute(username, mockCreateTechnologyDto);

            expect(result).toEqual(mockTechnology);
            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).toHaveBeenCalledWith(
                username,
                mockCreateTechnologyDto.name,
            );
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockTechnologiesService.incrementDisplayOrderFrom).toHaveBeenCalledWith(1, mockUser.id);
            expect(mockTechnologiesService.create).toHaveBeenCalledWith({
                ...mockCreateTechnologyDto,
                userId: mockUser.id,
                displayOrder: 1,
            });
        });

        it('deve lançar exceção quando tecnologia já existe', async () => {
            const username = 'testuser';
            const existingTechnology = { ...mockTechnology, name: 'Node.js' };

            mockTechnologiesService.existsByTechnologyNameAndUsername.mockResolvedValue(
                existingTechnology,
            );

            await expect(useCase.execute(username, mockCreateTechnologyDto)).rejects.toThrow(
                TechnologyAlreadyExistsException,
            );

            expect(mockUsersService.findOneBy).not.toHaveBeenCalled();
            expect(mockTechnologiesService.create).not.toHaveBeenCalled();
        });

        it('não deve verificar nome quando name está vazio', async () => {
            const username = 'testuser';
            const createDtoWithoutName = { ...mockCreateTechnologyDto, name: '' };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockTechnologiesService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockTechnologiesService.create.mockResolvedValue(mockTechnology);

            await useCase.execute(username, createDtoWithoutName);

            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).not.toHaveBeenCalled();
        });

        it('não deve verificar nome quando name é null', async () => {
            const username = 'testuser';
            const createDtoWithoutName = { ...mockCreateTechnologyDto, name: null as any };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockTechnologiesService.incrementDisplayOrderFrom.mockResolvedValue(undefined);
            mockTechnologiesService.create.mockResolvedValue(mockTechnology);

            await useCase.execute(username, createDtoWithoutName);

            expect(mockTechnologiesService.existsByTechnologyNameAndUsername).not.toHaveBeenCalled();
        });
    });
});

