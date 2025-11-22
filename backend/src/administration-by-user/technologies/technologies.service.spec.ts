import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnologiesService } from './technologies.service';
import { CacheService } from '../../@common/services/cache.service';
import { UsersService } from '../users/users.service';
import { ImageUploadService } from '../images/services/image-upload.service';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';

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
jest.mock('../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

jest.mock('../images/services/image-upload.service', () => ({
    ImageUploadService: jest.fn().mockImplementation(() => ({
        deleteFile: jest.fn(),
    })),
}));

jest.mock('../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
        del: jest.fn(),
        technologyKey: jest.fn(),
    })),
}));

import { Technology } from './entities/technology.entity';

describe('TechnologiesService', () => {
    let service: TechnologiesService;
    let repository: Repository<Technology>;
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

    const mockCacheService = {
        generateKey: jest.fn(),
        getOrSet: jest.fn(),
        del: jest.fn(),
        technologyKey: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockImageUploadService = {
        deleteFile: jest.fn(),
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
            providers: [
                TechnologiesService,
                {
                    provide: getRepositoryToken(Technology),
                    useValue: mockRepository,
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

        service = module.get<TechnologiesService>(TechnologiesService);
        repository = module.get<Repository<Technology>>(getRepositoryToken(Technology));
        cacheService = module.get<CacheService>(CacheService);
        usersService = module.get<UsersService>(UsersService);
        imageUploadService = module.get<ImageUploadService>(ImageUploadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('deve retornar tecnologias paginadas', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10, sortBy: 'displayOrder', sortOrder: 'ASC' };
            const mockData = [mockTechnology];
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
                data: [mockTechnology],
                meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
            };

            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockResolvedValue(cachedData);

            const result = await service.findAll(username, paginationDto);

            expect(result).toEqual(cachedData);
            expect(mockRepository.findAndCount).not.toHaveBeenCalled();
        });

        it('deve filtrar por isActive quando fornecido', async () => {
            const username = 'testuser';
            const paginationDto: PaginationDto = { page: 1, limit: 10, isActive: true };

            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(username, paginationDto);

            expect(mockRepository.findAndCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                where: { user: { username }, isActive: true },
                order: { displayOrder: 'ASC' },
            });
        });
    });

    describe('findById', () => {
        it('deve retornar uma tecnologia por ID', async () => {
            const id = 1;
            const username = 'testuser';

            mockCacheService.technologyKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findOne.mockResolvedValue(mockTechnology);

            const result = await service.findById(id, username);

            expect(result).toEqual(mockTechnology);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id, user: { username } },
            });
        });

        it('deve lançar exceção quando tecnologia não encontrada', async () => {
            const id = 999;
            const username = 'testuser';

            mockCacheService.technologyKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findById(id, username)).rejects.toThrow(
                TechnologyNotFoundException,
            );
        });
    });

    describe('create', () => {
        it('deve criar uma nova tecnologia', async () => {
            const createDto: CreateTechnologyDto = {
                name: 'React',
                expertiseLevel: 'ADVANCED' as any,
            };

            mockRepository.create.mockReturnValue(mockTechnology);
            mockRepository.save.mockResolvedValue(mockTechnology);
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.create(createDto);

            expect(result).toEqual(mockTechnology);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockTechnology);
            expect(mockCacheService.del).toHaveBeenCalledTimes(3);
        });
    });

    describe('update', () => {
        it('deve atualizar uma tecnologia existente', async () => {
            const id = 1;
            const updateDto: UpdateTechnologyDto = { name: 'Updated Name' };
            const updatedTechnology = { ...mockTechnology, ...updateDto };

            mockRepository.findOneBy.mockResolvedValue(mockTechnology);
            mockRepository.merge.mockImplementation((target, source) => {
                Object.assign(target, source);
                return target;
            });
            mockRepository.save.mockResolvedValue(updatedTechnology);
            mockCacheService.technologyKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.update(id, updateDto);

            expect(result).toEqual(updatedTechnology);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
            expect(mockRepository.merge).toHaveBeenCalledWith(mockTechnology, updateDto);
            expect(mockRepository.save).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('deve deletar uma tecnologia sem imagem', async () => {
            const id = 1;
            const technologyWithoutImage = { ...mockTechnology, profileImage: null };

            mockRepository.findOneBy.mockResolvedValue(technologyWithoutImage);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.technologyKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);

            await service.delete(id);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
            expect(mockImageUploadService.deleteFile).not.toHaveBeenCalled();
            expect(mockRepository.delete).toHaveBeenCalledWith(id);
        });

        it('deve deletar uma tecnologia com imagem', async () => {
            const id = 1;
            const technologyWithImage = { ...mockTechnology, profileImage: 'image.png' };

            mockRepository.findOneBy.mockResolvedValue(technologyWithImage);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.technologyKey.mockReturnValue('cache:key');
            mockCacheService.generateKey.mockReturnValue('cache:key');
            mockCacheService.del.mockResolvedValue(undefined);
            mockImageUploadService.deleteFile.mockResolvedValue(undefined);

            await service.delete(id);

            expect(mockImageUploadService.deleteFile).toHaveBeenCalledWith(
                'technologies',
                'image.png',
            );
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

    describe('getStats', () => {
        it('deve retornar estatísticas de tecnologias', async () => {
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

    describe('existsByTechnologyNameAndUsername', () => {
        it('deve retornar tecnologia quando nome existe', async () => {
            const username = 'testuser';
            const name = 'Node.js';

            mockRepository.findOneBy.mockResolvedValue(mockTechnology);

            const result = await service.existsByTechnologyNameAndUsername(username, name);

            expect(result).toEqual(mockTechnology);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ user: { username }, name });
        });

        it('deve retornar null quando nome não existe', async () => {
            const username = 'testuser';
            const name = 'Non-existent Technology';

            mockRepository.findOneBy.mockResolvedValue(null);

            const result = await service.existsByTechnologyNameAndUsername(username, name);

            expect(result).toBeNull();
        });
    });
});

