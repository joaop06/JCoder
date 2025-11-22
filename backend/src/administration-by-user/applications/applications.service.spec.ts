import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';
import { PaginationDto } from '../../@common/dto/pagination.dto';

// Mock das entidades para evitar dependências circulares
jest.mock('./entities/application.entity', () => ({
    Application: class Application {},
}));
jest.mock('../technologies/entities/technology.entity', () => ({
    Technology: class Technology {},
}));
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock dos serviços antes de importar para evitar dependências circulares
jest.mock('../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../images/services/image-upload.service', () => ({
    ImageUploadService: jest.fn().mockImplementation(() => ({
        deleteAllApplicationImages: jest.fn(),
    })),
}));

// Não mockar getRepositoryToken, vamos usar o real

import { ApplicationsService } from './applications.service';
import { CacheService } from '../../@common/services/cache.service';
import { UsersService } from '../users/users.service';
import { ImageUploadService } from '../images/services/image-upload.service';

// Mock das entidades para evitar dependências circulares
class Application {}
class Technology {}

describe('ApplicationsService', () => {
    let service: ApplicationsService;
    let repository: Repository<Application>;
    let technologyRepository: Repository<Technology>;
    let cacheService: CacheService;
    let usersService: UsersService;
    let imageUploadService: ImageUploadService;

    const mockRepository = {
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        merge: jest.fn(),
        createQueryBuilder: jest.fn(),
        count: jest.fn(),
    };

    const mockTechnologyRepository = {
        find: jest.fn(),
    };

    const mockCacheService = {
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
        del: jest.fn(),
        applicationKey: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockImageUploadService = {
        deleteAllApplicationImages: jest.fn(),
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
        images: [],
    } as Application;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationsService,
                {
                    provide: getRepositoryToken(Application),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Technology),
                    useValue: mockTechnologyRepository,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: ImageUploadService,
                    useValue: mockImageUploadService,
                },
            ],
        }).compile();

        service = module.get<ApplicationsService>(ApplicationsService);
        repository = module.get<Repository<Application>>(getRepositoryToken(Application));
        technologyRepository = module.get<Repository<Technology>>(getRepositoryToken(Technology));
        cacheService = module.get<CacheService>(CacheService);
        usersService = module.get<UsersService>(UsersService);
        imageUploadService = module.get<ImageUploadService>(ImageUploadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('deve retornar aplicações paginadas', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10, sortBy: 'displayOrder', sortOrder: 'ASC' };
            const mockData = [mockApplication];
            const mockTotal = 1;

            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

            const result = await service.findAll(username, paginationDto);

            expect(result.data).toEqual(mockData);
            expect(result.meta.total).toBe(mockTotal);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(mockRepository.findAndCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                where: { user: { username } },
                order: { displayOrder: 'ASC' },
            });
        });

        it('deve usar cache quando disponível', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const cachedData = {
                data: [mockApplication],
                meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
            };

            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockResolvedValue(cachedData);

            const result = await service.findAll(username, paginationDto);

            expect(result).toEqual(cachedData);
            expect(mockRepository.findAndCount).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('deve retornar uma aplicação por ID', async () => {
            const id = 1;
            const username = 'testuser';

            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findOne.mockResolvedValue(mockApplication);

            const result = await service.findById(id, username);

            expect(result).toEqual(mockApplication);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id, user: { username } },
                relations: {
                    user: true,
                    technologies: true,
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
        });

        it('deve lançar exceção quando aplicação não encontrada', async () => {
            const id = 999;
            const username = 'testuser';

            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findById(id, username)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('create', () => {
        it('deve criar uma nova aplicação', async () => {
            const createDto = {
                userId: 1,
                name: 'New Application',
                description: 'New Description',
                displayOrder: 1,
            };

            mockRepository.create.mockReturnValue(mockApplication);
            mockRepository.save.mockResolvedValue(mockApplication);
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.create(createDto);

            expect(result).toEqual(mockApplication);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockApplication);
            expect(mockCacheService.del).toHaveBeenCalledTimes(3);
        });
    });

    describe('update', () => {
        it('deve atualizar uma aplicação existente', async () => {
            const id = 1;
            const updateDto = { name: 'Updated Name' };
            const updatedApplication = { ...mockApplication, name: 'Updated Name' };

            mockRepository.findOneBy.mockResolvedValue(mockApplication);
            // merge modifica o objeto original, então vamos fazer isso manualmente
            mockRepository.merge.mockImplementation((target, source) => {
                Object.assign(target, source);
                return target;
            });
            mockRepository.save.mockResolvedValue(updatedApplication);
            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.update(id, updateDto);

            expect(result).toEqual(updatedApplication);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
            expect(mockRepository.merge).toHaveBeenCalledWith(mockApplication, updateDto);
            expect(mockRepository.save).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('deve deletar uma aplicação sem imagens', async () => {
            const id = 1;
            const applicationWithoutImages = { ...mockApplication, images: null };

            mockRepository.findOneBy.mockResolvedValue(applicationWithoutImages);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            await service.delete(id);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
            expect(mockImageUploadService.deleteAllApplicationImages).not.toHaveBeenCalled();
            expect(mockRepository.delete).toHaveBeenCalledWith(id);
        });

        it('deve deletar uma aplicação com imagens', async () => {
            const id = 1;
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };

            mockRepository.findOneBy.mockResolvedValue(applicationWithImages);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);
            mockImageUploadService.deleteAllApplicationImages.mockResolvedValue(undefined);

            await service.delete(id);

            expect(mockImageUploadService.deleteAllApplicationImages).toHaveBeenCalledWith(id);
            expect(mockRepository.delete).toHaveBeenCalledWith(id);
        });
    });

    describe('incrementDisplayOrderFrom', () => {
        it('deve incrementar displayOrder a partir de uma posição', async () => {
            const startPosition = 1;
            const userId = 1;
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.incrementDisplayOrderFrom(startPosition, userId);

            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.update).toHaveBeenCalled();
            expect(mockQueryBuilder.set).toHaveBeenCalled();
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });
    });

    describe('reorderOnUpdate', () => {
        it('não deve fazer nada quando posições são iguais', async () => {
            const id = 1;
            const oldPosition = 2;
            const newPosition = 2;
            const username = 'testuser';

            await service.reorderOnUpdate(id, oldPosition, newPosition, username);

            expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
        });

        it('deve reordenar quando move para cima', async () => {
            const id = 1;
            const oldPosition = 5;
            const newPosition = 2;
            const username = 'testuser';
            const mockUser = { id: 1, username };
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined),
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.reorderOnUpdate(id, oldPosition, newPosition, username);

            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });

        it('deve reordenar quando move para baixo', async () => {
            const id = 1;
            const oldPosition = 2;
            const newPosition = 5;
            const username = 'testuser';
            const mockUser = { id: 1, username };
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined),
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.reorderOnUpdate(id, oldPosition, newPosition, username);

            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });
    });

    describe('decrementDisplayOrderAfter', () => {
        it('deve decrementar displayOrder após uma posição', async () => {
            const deletedPosition = 3;
            const username = 'testuser';
            const mockUser = { id: 1, username };
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined),
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.decrementDisplayOrderAfter(deletedPosition, username);

            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });
    });

    describe('setApplicationTechnologies', () => {
        it('deve associar tecnologias a uma aplicação', async () => {
            const applicationId = 1;
            const technologyIds = [1, 2, 3];
            const mockTechnologies = [
                { id: 1, name: 'Tech1' },
                { id: 2, name: 'Tech2' },
                { id: 3, name: 'Tech3' },
            ];
            const mockApplicationWithTechs = {
                ...mockApplication,
                technologies: mockTechnologies,
            };
            const mockQueryBuilder = {
                relation: jest.fn().mockReturnThis(),
                of: jest.fn().mockReturnThis(),
                addAndRemove: jest.fn().mockResolvedValue(undefined),
            };

            mockTechnologyRepository.find.mockResolvedValue(mockTechnologies);
            mockRepository.findOne.mockResolvedValue(mockApplicationWithTechs);
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.setApplicationTechnologies(applicationId, technologyIds);

            expect(mockTechnologyRepository.find).toHaveBeenCalledWith({
                where: { id: expect.anything() },
            });
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
        });

        it('deve remover todas as tecnologias quando array vazio', async () => {
            const applicationId = 1;
            const technologyIds: number[] = [];
            const mockApplicationWithTechs = {
                ...mockApplication,
                technologies: [{ id: 1 }, { id: 2 }],
            };
            const mockQueryBuilder = {
                relation: jest.fn().mockReturnThis(),
                of: jest.fn().mockReturnThis(),
                addAndRemove: jest.fn().mockResolvedValue(undefined),
            };

            mockRepository.findOne.mockResolvedValue(mockApplicationWithTechs);
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.setApplicationTechnologies(applicationId, technologyIds);

            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
        });

        it('deve lançar erro quando tecnologia não encontrada', async () => {
            const applicationId = 1;
            const technologyIds = [1, 2, 999];
            const mockTechnologies = [{ id: 1 }, { id: 2 }];

            mockTechnologyRepository.find.mockResolvedValue(mockTechnologies);

            await expect(
                service.setApplicationTechnologies(applicationId, technologyIds),
            ).rejects.toThrow('Technologies not found: 999');
        });
    });

    describe('getStats', () => {
        it('deve retornar estatísticas de aplicações', async () => {
            const username = 'testuser';
            const mockStats = { total: 10, active: 7, inactive: 3 };

            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.count
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(7) // active
                .mockResolvedValueOnce(3); // inactive

            const result = await service.getStats(username);

            expect(result).toEqual(mockStats);
            expect(mockRepository.count).toHaveBeenCalledTimes(3);
        });
    });

    describe('existsByApplicationNameAndUsername', () => {
        it('deve retornar aplicação quando nome existe', async () => {
            const username = 'testuser';
            const name = 'Test Application';

            mockRepository.findOneBy.mockResolvedValue(mockApplication);

            const result = await service.existsByApplicationNameAndUsername(username, name);

            expect(result).toEqual(mockApplication);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ name, user: { username } });
        });

        it('deve retornar null quando nome não existe', async () => {
            const username = 'testuser';
            const name = 'Non-existent Application';

            mockRepository.findOneBy.mockResolvedValue(null);

            const result = await service.existsByApplicationNameAndUsername(username, name);

            expect(result).toBeNull();
        });
    });
});

