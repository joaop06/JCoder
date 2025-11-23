import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from './images.service';
import { CacheService } from '../../@common/services/cache.service';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../applications/entities/application.entity', () => ({
    Application: class Application {},
}));

// Mock dos serviços antes de importar
jest.mock('../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        applicationKey: jest.fn(),
        getOrSet: jest.fn(),
    })),
}));

import { Application } from '../applications/entities/application.entity';

// Mock das entidades para evitar dependências circulares
class Application {}

describe('ImagesService', () => {
    let service: ImagesService;
    let applicationRepository: Repository<Application>;
    let cacheService: CacheService;

    const mockApplicationRepository = {
        findOne: jest.fn(),
    };

    const mockCacheService = {
        applicationKey: jest.fn(),
        getOrSet: jest.fn(),
    };

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        images: [],
        user: { username: 'testuser' } as any,
    } as Application;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImagesService,
                {
                    provide: getRepositoryToken(Application),
                    useValue: mockApplicationRepository,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
            ],
        }).compile();

        service = module.get<ImagesService>(ImagesService);
        applicationRepository = module.get<Repository<Application>>(getRepositoryToken(Application));
        cacheService = module.get<CacheService>(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findApplicationById', () => {
        it('deve retornar aplicação por ID', async () => {
            const id = 1;

            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

            const result = await service.findApplicationById(id);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
                where: { id },
                relations: {
                    user: true,
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
        });

        it('deve lançar exceção quando aplicação não encontrada', async () => {
            const id = 999;

            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
                return await factory();
            });
            mockApplicationRepository.findOne.mockResolvedValue(null);

            await expect(service.findApplicationById(id)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('deve usar cache quando disponível', async () => {
            const id = 1;

            mockCacheService.applicationKey.mockReturnValue('cache:key');
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);

            const result = await service.findApplicationById(id);

            expect(result).toEqual(mockApplication);
            expect(mockApplicationRepository.findOne).not.toHaveBeenCalled();
        });
    });
});




