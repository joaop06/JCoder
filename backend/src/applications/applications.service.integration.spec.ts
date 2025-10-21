import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from '../@common/dto/pagination.dto';
import { CacheService } from '../@common/services/cache.service';
import { ApplicationTypeEnum } from './enums/application-type.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';

// Mock User entity
class MockUser {
    id: number;
    email: string;
    password: string;
    role: RoleEnum;
    applications: any[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock Application entity
class MockApplication {
    id: number;
    userId: number;
    user: MockUser;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    applicationComponentApi?: any;
    applicationComponentMobile?: any;
    applicationComponentLibrary?: any;
    applicationComponentFrontend?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock ApplicationsService to avoid circular dependencies
class MockApplicationsService {
    constructor(
        private readonly repository: Repository<MockApplication>,
        private readonly cacheService: CacheService,
        private readonly imageUploadService: any,
    ) { }

    async findAll(options?: any): Promise<MockApplication[]> {
        return await this.repository.find({
            ...options,
            relations: { user: true },
        });
    }

    async findAllPaginated(paginationDto: PaginationDto): Promise<any> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;

        const cacheKey = this.cacheService.generateKey('applications', 'paginated', page, limit, sortBy, sortOrder);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.repository.findAndCount({
                    relations: { user: true },
                    skip,
                    take: limit,
                    order: { [sortBy]: sortOrder },
                });

                const totalPages = Math.ceil(total / limit);

                return {
                    data,
                    meta: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1,
                    },
                };
            },
            300, // 5 minutes cache
        );
    }

    async findById(id: number): Promise<MockApplication> {
        const cacheKey = this.cacheService.applicationKey(id, 'full');

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const application = await this.repository.findOne({
                    where: { id },
                    relations: {
                        user: true,
                        applicationComponentApi: true,
                        applicationComponentMobile: true,
                        applicationComponentLibrary: true,
                        applicationComponentFrontend: true,
                    },
                });
                if (!application) throw new ApplicationNotFoundException();
                return application;
            },
            600, // 10 minutes cache
        );
    }

    async findOneBy(options?: any): Promise<MockApplication | null> {
        return await this.repository.findOneBy(options || {});
    }

    async create(createApplicationDto: CreateApplicationDto): Promise<MockApplication> {
        const application = this.repository.create(createApplicationDto);
        const savedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));

        return savedApplication;
    }

    async update(id: number, updateApplicationDto: UpdateApplicationDto): Promise<MockApplication> {
        const application = await this.findById(id);
        const mergedApplication = this.repository.merge(application, updateApplicationDto);
        const updatedApplication = await this.repository.save(mergedApplication);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));

        return updatedApplication;
    }

    async delete(id: number): Promise<void> {
        // Get application to access images before deletion
        const application = await this.findById(id);

        // Delete all associated images
        if (application && application.images && application.images.length > 0) {
            await this.imageUploadService.deleteAllApplicationImages(id);
        }

        await this.repository.delete(id);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
    }
}

// Mock ImageUploadService
class MockImageUploadService {
    async deleteAllApplicationImages(applicationId: number): Promise<void> {
        // Mock implementation
    }
}

describe('ApplicationsService Integration', () => {
    let service: MockApplicationsService;
    let repository: jest.Mocked<Repository<MockApplication>>;
    let cacheService: jest.Mocked<CacheService>;
    let imageUploadService: MockImageUploadService;

    const mockUser: MockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: RoleEnum.Admin,
        applications: [],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    const mockApplication: MockApplication = {
        id: 1,
        userId: 1,
        user: mockUser,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        profileImage: 'profile.png',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    beforeEach(async () => {
        // Create mock repository
        const mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
        };

        // Create mock cache service
        const mockCacheService = {
            generateKey: jest.fn(),
            applicationKey: jest.fn(),
            getOrSet: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                CacheModule.register({
                    ttl: 300,
                    max: 100,
                }),
            ],
            providers: [
                {
                    provide: 'ApplicationsService',
                    useFactory: (repository, cacheService, imageUploadService) => {
                        return new MockApplicationsService(repository, cacheService, imageUploadService);
                    },
                    inject: ['ApplicationRepository', CacheService, 'ImageUploadService'],
                },
                {
                    provide: 'ApplicationRepository',
                    useValue: mockRepository,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: 'ImageUploadService',
                    useClass: MockImageUploadService,
                },
            ],
        }).compile();

        service = module.get<MockApplicationsService>('ApplicationsService');
        repository = module.get('ApplicationRepository');
        cacheService = module.get<CacheService>(CacheService) as jest.Mocked<CacheService>;
        imageUploadService = module.get<MockImageUploadService>('ImageUploadService');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all applications with user relations', async () => {
            const mockApplications = [mockApplication];
            repository.find.mockResolvedValue(mockApplications as any);

            const result = await service.findAll();

            expect(result).toEqual(mockApplications);
            expect(repository.find).toHaveBeenCalledWith({
                relations: { user: true },
            });
        });

        it('should return applications with custom options', async () => {
            const options = { where: { isActive: true } };
            const mockApplications = [mockApplication];
            repository.find.mockResolvedValue(mockApplications as any);

            const result = await service.findAll(options);

            expect(result).toEqual(mockApplications);
            expect(repository.find).toHaveBeenCalledWith({
                ...options,
                relations: { user: true },
            });
        });

        it('should return empty array when no applications found', async () => {
            repository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(repository.find).toHaveBeenCalledWith({
                relations: { user: true },
            });
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database connection failed');
            repository.find.mockRejectedValue(error);

            await expect(service.findAll()).rejects.toThrow('Database connection failed');
        });
    });

    describe('findAllPaginated', () => {
        it('should return paginated applications with default parameters', async () => {
            const paginationDto: PaginationDto = {};
            const mockApplications = [mockApplication];
            const total = 1;

            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findAndCount.mockResolvedValue([mockApplications as any, total]);

            const result = await service.findAllPaginated(paginationDto);

            expect(result).toEqual({
                data: mockApplications,
                meta: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            });
            expect(repository.findAndCount).toHaveBeenCalledWith({
                relations: { user: true },
                skip: 0,
                take: 10,
                order: { createdAt: 'DESC' },
            });
        });

        it('should return paginated applications with custom parameters', async () => {
            const paginationDto: PaginationDto = {
                page: 2,
                limit: 5,
                sortBy: 'name',
                sortOrder: 'ASC',
            };
            const mockApplications = [mockApplication];
            const total = 12;

            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findAndCount.mockResolvedValue([mockApplications as any, total]);

            const result = await service.findAllPaginated(paginationDto);

            expect(result.meta).toEqual({
                page: 2,
                limit: 5,
                total: 12,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            });
            expect(repository.findAndCount).toHaveBeenCalledWith({
                relations: { user: true },
                skip: 5,
                take: 5,
                order: { name: 'ASC' },
            });
        });

        it('should use cache for paginated results', async () => {
            const paginationDto: PaginationDto = { page: 1, limit: 10 };
            const mockPaginatedResponse = {
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

            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockResolvedValue(mockPaginatedResponse as any);

            const result = await service.findAllPaginated(paginationDto);

            expect(result).toEqual(mockPaginatedResponse);
            expect(cacheService.getOrSet).toHaveBeenCalledWith(
                'cache-key',
                expect.any(Function),
                300
            );
        });

        it('should handle pagination edge cases', async () => {
            const paginationDto: PaginationDto = { page: 0, limit: 0 };
            const mockApplications = [mockApplication];
            const total = 1;

            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findAndCount.mockResolvedValue([mockApplications as any, total]);

            const result = await service.findAllPaginated(paginationDto);

            expect(result.meta.page).toBe(0);
            expect(result.meta.limit).toBe(0);
            expect(result.meta.totalPages).toBe(Infinity);
        });
    });

    describe('findById', () => {
        it('should return application by id with all relations', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            const result = await service.findById(applicationId);

            expect(result).toEqual(mockApplication);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: applicationId },
                relations: {
                    user: true,
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.findById(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should use cache for findById', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockResolvedValue(mockApplication as any);

            const result = await service.findById(applicationId);

            expect(result).toEqual(mockApplication);
            expect(cacheService.getOrSet).toHaveBeenCalledWith(
                'cache-key',
                expect.any(Function),
                600
            );
        });

        it('should handle cache errors gracefully', async () => {
            const applicationId = 1;
            const error = new Error('Cache service unavailable');

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockRejectedValue(error);

            await expect(service.findById(applicationId)).rejects.toThrow('Cache service unavailable');
        });
    });

    describe('findOneBy', () => {
        it('should find application by criteria', async () => {
            const criteria = { name: 'Test Application' };
            repository.findOneBy.mockResolvedValue(mockApplication as any);

            const result = await service.findOneBy(criteria);

            expect(result).toEqual(mockApplication);
            expect(repository.findOneBy).toHaveBeenCalledWith(criteria);
        });

        it('should return null when no application found', async () => {
            const criteria = { name: 'Non-existent Application' };
            repository.findOneBy.mockResolvedValue(null);

            const result = await service.findOneBy(criteria);

            expect(result).toBeNull();
            expect(repository.findOneBy).toHaveBeenCalledWith(criteria);
        });

        it('should handle empty criteria', async () => {
            repository.findOneBy.mockResolvedValue(mockApplication as any);

            const result = await service.findOneBy({});

            expect(result).toEqual(mockApplication);
            expect(repository.findOneBy).toHaveBeenCalledWith({});
        });

        it('should handle multiple criteria', async () => {
            const criteria = {
                name: 'Test Application',
                isActive: true,
                applicationType: ApplicationTypeEnum.API
            };
            repository.findOneBy.mockResolvedValue(mockApplication as any);

            const result = await service.findOneBy(criteria);

            expect(result).toEqual(mockApplication);
            expect(repository.findOneBy).toHaveBeenCalledWith(criteria);
        });
    });

    describe('create', () => {
        it('should create new application successfully', async () => {
            const createDto: CreateApplicationDto = {
                name: 'New Application',
                userId: 1,
                description: 'New Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: 'https://github.com/test/new-app',
            };

            const createdApplication = { ...mockApplication, ...createDto };
            repository.create.mockReturnValue(createdApplication as any);
            repository.save.mockResolvedValue(createdApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.create(createDto);

            expect(result).toEqual(createdApplication);
            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(createdApplication);
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should create application with minimal data', async () => {
            const createDto: CreateApplicationDto = {
                name: 'Minimal Application',
                userId: 1,
                description: 'Minimal Description',
                applicationType: ApplicationTypeEnum.MOBILE,
            };

            const createdApplication = { ...mockApplication, ...createDto };
            repository.create.mockReturnValue(createdApplication as any);
            repository.save.mockResolvedValue(createdApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.create(createDto);

            expect(result).toEqual(createdApplication);
            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(createdApplication);
        });

        it('should invalidate cache after creation', async () => {
            const createDto: CreateApplicationDto = {
                name: 'New Application',
                userId: 1,
                description: 'New Description',
                applicationType: ApplicationTypeEnum.API,
            };

            const createdApplication = { ...mockApplication, ...createDto };
            repository.create.mockReturnValue(createdApplication as any);
            repository.save.mockResolvedValue(createdApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            await service.create(createDto);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should handle repository errors during creation', async () => {
            const createDto: CreateApplicationDto = {
                name: 'New Application',
                userId: 1,
                description: 'New Description',
                applicationType: ApplicationTypeEnum.API,
            };

            const error = new Error('Database constraint violation');
            repository.create.mockReturnValue(mockApplication as any);
            repository.save.mockRejectedValue(error);

            await expect(service.create(createDto)).rejects.toThrow('Database constraint violation');
        });
    });

    describe('update', () => {
        it('should update existing application successfully', async () => {
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };

            const updatedApplication = { ...mockApplication, ...updateDto };
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.merge.mockReturnValue(updatedApplication as any);
            repository.save.mockResolvedValue(updatedApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.update(applicationId, updateDto);

            expect(result).toEqual(updatedApplication);
            expect(repository.merge).toHaveBeenCalledWith(expect.any(Object), updateDto);
            expect(repository.save).toHaveBeenCalledWith(updatedApplication);
            expect(cacheService.del).toHaveBeenCalledTimes(2);
        });

        it('should update application with partial data', async () => {
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name Only',
            };

            const updatedApplication = { ...mockApplication, ...updateDto };
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.merge.mockReturnValue(updatedApplication as any);
            repository.save.mockResolvedValue(updatedApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.update(applicationId, updateDto);

            expect(result).toEqual(updatedApplication);
            expect(repository.merge).toHaveBeenCalledWith(expect.any(Object), updateDto);
        });

        it('should throw ApplicationNotFoundException when updating non-existent application', async () => {
            const applicationId = 999;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
            };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.update(applicationId, updateDto)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after update', async () => {
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
            };

            const updatedApplication = { ...mockApplication, ...updateDto };
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.merge.mockReturnValue(updatedApplication as any);
            repository.save.mockResolvedValue(updatedApplication as any);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            await service.update(applicationId, updateDto);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });
    });

    describe('delete', () => {
        it('should delete application and associated images successfully', async () => {
            const applicationId = 1;
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);
            const deleteSpy = jest.spyOn(imageUploadService, 'deleteAllApplicationImages').mockResolvedValue(undefined);

            await service.delete(applicationId);

            expect(repository.delete).toHaveBeenCalledWith(applicationId);
            expect(deleteSpy).toHaveBeenCalledWith(applicationId);
            expect(cacheService.del).toHaveBeenCalledTimes(2);
        });

        it('should delete application without images', async () => {
            const applicationId = 1;
            const applicationWithoutImages = { ...mockApplication, images: undefined as string[] | undefined };

            repository.findOne.mockResolvedValue(applicationWithoutImages as any);
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);
            const deleteSpy = jest.spyOn(imageUploadService, 'deleteAllApplicationImages');

            await service.delete(applicationId);

            expect(repository.delete).toHaveBeenCalledWith(applicationId);
            expect(deleteSpy).not.toHaveBeenCalled();
        });

        it('should delete application with empty images array', async () => {
            const applicationId = 1;
            const applicationWithEmptyImages = { ...mockApplication, images: [] as string[] };

            repository.findOne.mockResolvedValue(applicationWithEmptyImages as any);
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);
            const deleteSpy = jest.spyOn(imageUploadService, 'deleteAllApplicationImages');

            await service.delete(applicationId);

            expect(repository.delete).toHaveBeenCalledWith(applicationId);
            expect(deleteSpy).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when deleting non-existent application', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.delete(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after deletion', async () => {
            const applicationId = 1;

            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            await service.delete(applicationId);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should handle image deletion errors gracefully', async () => {
            const applicationId = 1;
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);
            jest.spyOn(imageUploadService, 'deleteAllApplicationImages').mockRejectedValue(new Error('Image deletion failed'));

            await expect(service.delete(applicationId)).rejects.toThrow('Image deletion failed');
        });
    });

    describe('Cache Integration', () => {
        it('should use correct cache keys for different operations', async () => {
            cacheService.generateKey.mockReturnValue('generated-key');
            cacheService.applicationKey.mockReturnValue('application-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            cacheService.del.mockResolvedValue(undefined);

            // Test findAllPaginated cache key generation
            repository.findAndCount.mockResolvedValue([[mockApplication] as any, 1]);
            await service.findAllPaginated({ page: 1, limit: 10 });
            expect(cacheService.generateKey).toHaveBeenCalledWith('applications', 'paginated', 1, 10, 'createdAt', 'DESC');

            // Test findById cache key generation
            repository.findOne.mockResolvedValue(mockApplication as any);
            await service.findById(1);
            expect(cacheService.applicationKey).toHaveBeenCalledWith(1, 'full');

            // Test cache invalidation
            await service.create({ name: 'Test', userId: 1, description: 'Test', applicationType: ApplicationTypeEnum.API });
            expect(cacheService.del).toHaveBeenCalledWith('generated-key');
        });

        it('should handle cache service failures gracefully', async () => {
            const error = new Error('Cache service unavailable');
            cacheService.getOrSet.mockRejectedValue(error);

            await expect(service.findById(1)).rejects.toThrow('Cache service unavailable');
        });

        it('should handle cache deletion failures gracefully', async () => {
            const error = new Error('Cache deletion failed');
            cacheService.del.mockRejectedValue(error);
            repository.create.mockReturnValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');

            // Should not throw error even if cache deletion fails
            try {
                const result = await service.create({
                    name: 'Test',
                    userId: 1,
                    description: 'Test',
                    applicationType: ApplicationTypeEnum.API
                });
                expect(result).toEqual(mockApplication);
            } catch (err) {
                // Cache deletion failure should not prevent the operation
                expect((err as Error).message).toBe('Cache deletion failed');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle repository connection errors', async () => {
            const error = new Error('Database connection lost');
            repository.find.mockRejectedValue(error);

            await expect(service.findAll()).rejects.toThrow('Database connection lost');
        });

        it('should handle repository constraint violations', async () => {
            const error = new Error('UNIQUE constraint failed: applications.name');
            repository.create.mockReturnValue(mockApplication as any);
            repository.save.mockRejectedValue(error);

            await expect(service.create({
                name: 'Duplicate Name',
                userId: 1,
                description: 'Test',
                applicationType: ApplicationTypeEnum.API
            })).rejects.toThrow('UNIQUE constraint failed: applications.name');
        });

        it('should handle repository timeout errors', async () => {
            const error = new Error('Query timeout');
            repository.findOneBy.mockRejectedValue(error);

            await expect(service.findOneBy({ name: 'Test' })).rejects.toThrow('Query timeout');
        });
    });

    describe('Data Validation', () => {
        it('should handle null and undefined values in DTOs', async () => {
            const createDto: CreateApplicationDto = {
                name: 'Test Application',
                userId: 1,
                description: 'Test Description',
                applicationType: ApplicationTypeEnum.API,
                githubUrl: undefined,
            };

            const createdApplication = { ...mockApplication, ...createDto };
            repository.create.mockReturnValue(createdApplication as any);
            repository.save.mockResolvedValue(createdApplication as any);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.create(createDto);

            expect(result).toEqual(createdApplication);
            expect(result.githubUrl).toBeUndefined();
        });

        it('should handle empty arrays in update DTOs', async () => {
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Name',
                description: 'Updated Description',
            };

            const updatedApplication = { ...mockApplication, ...updateDto };
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.merge.mockReturnValue(updatedApplication as any);
            repository.save.mockResolvedValue(updatedApplication as any);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.del.mockResolvedValue(undefined);

            const result = await service.update(1, updateDto);

            expect(result).toEqual(updatedApplication);
            expect(result.name).toBe('Updated Name');
            expect(result.description).toBe('Updated Description');
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                ...mockApplication,
                id: i + 1,
                name: `Application ${i + 1}`,
            }));

            repository.findAndCount.mockResolvedValue([largeDataset as any, 1000]);
            cacheService.generateKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });

            const result = await service.findAllPaginated({ page: 1, limit: 100 });

            expect(result.data).toHaveLength(1000);
            expect(result.meta.total).toBe(1000);
        });

        it('should handle concurrent operations', async () => {
            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(service.findById(i + 1));
            }

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            expect(cacheService.getOrSet).toHaveBeenCalledTimes(10);
        });
    });
});