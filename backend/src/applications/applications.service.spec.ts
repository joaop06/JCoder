import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { CacheService } from '../@common/services/cache.service';
import { ImageUploadService } from './services/image-upload.service';
import { ApplicationNotFoundException } from './exceptions/application-not-found.exception';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationTypeEnum } from './enums/application-type.enum';
import { PaginationDto } from '../@common/dto/pagination.dto';

describe('ApplicationsService', () => {
    let service: ApplicationsService;
    let repository: Repository<Application>;
    let cacheService: CacheService;
    let imageUploadService: ImageUploadService;

    const mockApplication: Application = {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        userId: 1,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        user: {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'admin' as any,
            applications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    };

    const mockRepository = {
        find: jest.fn(),
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        merge: jest.fn(),
        delete: jest.fn(),
    };

    const mockCacheService = {
        getOrSet: jest.fn(),
        del: jest.fn(),
        generateKey: jest.fn(),
        applicationKey: jest.fn(),
    };

    const mockImageUploadService = {
        uploadImages: jest.fn(),
        deleteApplicationImages: jest.fn(),
        deleteAllApplicationImages: jest.fn(),
        getImagePath: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationsService,
                {
                    provide: getRepositoryToken(Application),
                    useValue: mockRepository,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
                {
                    provide: ImageUploadService,
                    useValue: mockImageUploadService,
                },
            ],
        }).compile();

        service = module.get<ApplicationsService>(ApplicationsService);
        repository = module.get<Repository<Application>>(getRepositoryToken(Application));
        cacheService = module.get<CacheService>(CacheService);
        imageUploadService = module.get<ImageUploadService>(ImageUploadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all applications with relations', async () => {
            // Arrange
            const mockApplications = [mockApplication];
            mockRepository.find.mockResolvedValue(mockApplications);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual(mockApplications);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: { user: true },
            });
        });

        it('should return applications with custom options', async () => {
            // Arrange
            const options = { where: { isActive: true } };
            const mockApplications = [mockApplication];
            mockRepository.find.mockResolvedValue(mockApplications);

            // Act
            const result = await service.findAll(options);

            // Assert
            expect(result).toEqual(mockApplications);
            expect(mockRepository.find).toHaveBeenCalledWith({
                ...options,
                relations: { user: true },
            });
        });

        it('should handle empty results', async () => {
            // Arrange
            mockRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual([]);
            expect(mockRepository.find).toHaveBeenCalledTimes(1);
        });

        it('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockRepository.find.mockRejectedValue(dbError);

            // Act & Assert
            await expect(service.findAll()).rejects.toThrow('Database connection failed');
        });
    });

    describe('findAllPaginated', () => {
        it('should return paginated applications with cache', async () => {
            // Arrange
            const paginationDto: PaginationDto = {
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'DESC',
            };
            const mockPaginatedResult = {
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
            mockCacheService.getOrSet.mockResolvedValue(mockPaginatedResult);
            mockCacheService.generateKey.mockReturnValue('cache-key');

            // Act
            const result = await service.findAllPaginated(paginationDto);

            // Assert
            expect(result).toEqual(mockPaginatedResult);
            expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
                'cache-key',
                expect.any(Function),
                300,
            );
        });

        it('should use default pagination values', async () => {
            // Arrange
            const paginationDto: PaginationDto = {};
            const mockPaginatedResult = {
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
            mockCacheService.getOrSet.mockResolvedValue(mockPaginatedResult);

            // Act
            const result = await service.findAllPaginated(paginationDto);

            // Assert
            expect(result).toEqual(mockPaginatedResult);
        });

        it('should calculate pagination metadata correctly', async () => {
            // Arrange
            const paginationDto: PaginationDto = { page: 2, limit: 5 };
            mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
                return await fn();
            });
            mockRepository.findAndCount.mockResolvedValue([[mockApplication], 12]);

            // Act
            const result = await service.findAllPaginated(paginationDto);

            // Assert
            expect(result.meta.page).toBe(2);
            expect(result.meta.limit).toBe(5);
            expect(result.meta.total).toBe(12);
            expect(result.meta.totalPages).toBe(3);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(true);
        });
    });

    describe('findById', () => {
        it('should return application by id with cache', async () => {
            // Arrange
            const applicationId = 1;
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockCacheService.applicationKey.mockReturnValue('cache-key');

            // Act
            const result = await service.findById(applicationId);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
                'cache-key',
                expect.any(Function),
                600,
            );
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            // Arrange
            const applicationId = 999;
            mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
                return await fn();
            });
            mockRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should load application with all relations', async () => {
            // Arrange
            const applicationId = 1;
            mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
                return await fn();
            });
            mockRepository.findOne.mockResolvedValue(mockApplication);

            // Act
            await service.findById(applicationId);

            // Assert
            expect(mockRepository.findOne).toHaveBeenCalledWith({
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
    });

    describe('findOneBy', () => {
        it('should return application by criteria', async () => {
            // Arrange
            const criteria = { name: 'Test Application' };
            mockRepository.findOneBy.mockResolvedValue(mockApplication);

            // Act
            const result = await service.findOneBy(criteria);

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(criteria);
        });

        it('should return null when no application found', async () => {
            // Arrange
            const criteria = { name: 'Non-existent Application' };
            mockRepository.findOneBy.mockResolvedValue(null);

            // Act
            const result = await service.findOneBy(criteria);

            // Assert
            expect(result).toBeNull();
            expect(mockRepository.findOneBy).toHaveBeenCalledWith(criteria);
        });

        it('should use empty object when no criteria provided', async () => {
            // Arrange
            mockRepository.findOneBy.mockResolvedValue(mockApplication);

            // Act
            const result = await service.findOneBy();

            // Assert
            expect(result).toEqual(mockApplication);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({});
        });
    });

    describe('create', () => {
        it('should create and return new application', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'New Application',
                userId: 1,
                description: 'New Description',
                applicationType: ApplicationTypeEnum.API,
            };
            const createdApplication = { ...mockApplication, ...createDto };
            mockRepository.create.mockReturnValue(createdApplication);
            mockRepository.save.mockResolvedValue(createdApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result).toEqual(createdApplication);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(createdApplication);
            expect(mockCacheService.del).toHaveBeenCalled();
        });

        it('should invalidate cache after creation', async () => {
            // Arrange
            const createDto: CreateApplicationDto = {
                name: 'New Application',
                userId: 1,
                description: 'New Description',
                applicationType: ApplicationTypeEnum.API,
            };
            mockRepository.create.mockReturnValue(mockApplication);
            mockRepository.save.mockResolvedValue(mockApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            await service.create(createDto);

            // Assert
            expect(mockCacheService.del).toHaveBeenCalledWith(
                expect.stringContaining('applications'),
            );
        });
    });

    describe('update', () => {
        it('should update and return application', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = {
                name: 'Updated Application',
                description: 'Updated Description',
            };
            const updatedApplication = { ...mockApplication, ...updateDto };
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockRepository.merge.mockReturnValue(updatedApplication);
            mockRepository.save.mockResolvedValue(updatedApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            const result = await service.update(applicationId, updateDto);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockRepository.merge).toHaveBeenCalledWith(mockApplication, updateDto);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedApplication);
        });

        it('should invalidate cache after update', async () => {
            // Arrange
            const applicationId = 1;
            const updateDto: UpdateApplicationDto = { name: 'Updated Name' };
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockRepository.merge.mockReturnValue(mockApplication);
            mockRepository.save.mockResolvedValue(mockApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            await service.update(applicationId, updateDto);

            // Assert
            expect(mockCacheService.del).toHaveBeenCalledTimes(2);
        });
    });

    describe('delete', () => {
        it('should delete application and associated images', async () => {
            // Arrange
            const applicationId = 1;
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockImageUploadService.deleteAllApplicationImages.mockResolvedValue(undefined);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            await service.delete(applicationId);

            // Assert
            expect(mockImageUploadService.deleteAllApplicationImages).toHaveBeenCalledWith(applicationId);
            expect(mockRepository.delete).toHaveBeenCalledWith(applicationId);
            expect(mockCacheService.del).toHaveBeenCalledTimes(2);
        });

        it('should handle application without images', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImages = { ...mockApplication, images: [] };
            mockCacheService.getOrSet.mockResolvedValue(applicationWithoutImages);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            await service.delete(applicationId);

            // Assert
            expect(mockImageUploadService.deleteAllApplicationImages).not.toHaveBeenCalled();
            expect(mockRepository.delete).toHaveBeenCalledWith(applicationId);
        });

        it('should handle application with null images', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithNullImages = { ...mockApplication, images: null };
            mockCacheService.getOrSet.mockResolvedValue(applicationWithNullImages);
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            await service.delete(applicationId);

            // Assert
            expect(mockImageUploadService.deleteAllApplicationImages).not.toHaveBeenCalled();
            expect(mockRepository.delete).toHaveBeenCalledWith(applicationId);
        });
    });

    describe('uploadImages', () => {
        it('should upload images and update application', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { originalname: 'image1.jpg', buffer: Buffer.from('test') },
                { originalname: 'image2.png', buffer: Buffer.from('test') },
            ] as Express.Multer.File[];
            const newImageFilenames = ['new-image1.jpg', 'new-image2.png'];
            const updatedApplication = {
                ...mockApplication,
                images: [...mockApplication.images, ...newImageFilenames],
            };
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockImageUploadService.uploadImages.mockResolvedValue(newImageFilenames);
            mockRepository.save.mockResolvedValue(updatedApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            const result = await service.uploadImages(applicationId, files);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockImageUploadService.uploadImages).toHaveBeenCalledWith(files, applicationId);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedApplication);
        });

        it('should handle application with no existing images', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImages = { ...mockApplication, images: null };
            const files = [{ originalname: 'image1.jpg', buffer: Buffer.from('test') }] as Express.Multer.File[];
            const newImageFilenames = ['new-image1.jpg'];
            mockCacheService.getOrSet.mockResolvedValue(applicationWithoutImages);
            mockImageUploadService.uploadImages.mockResolvedValue(newImageFilenames);
            mockRepository.save.mockResolvedValue(applicationWithoutImages);

            // Act
            await service.uploadImages(applicationId, files);

            // Assert
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...applicationWithoutImages,
                images: newImageFilenames,
            });
        });
    });

    describe('deleteImage', () => {
        it('should delete image and update application', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const updatedApplication = {
                ...mockApplication,
                images: mockApplication.images.filter(img => img !== filename),
            };
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockImageUploadService.deleteApplicationImages.mockResolvedValue(undefined);
            mockRepository.save.mockResolvedValue(updatedApplication);
            mockCacheService.del.mockResolvedValue(undefined);

            // Act
            const result = await service.deleteImage(applicationId, filename);

            // Assert
            expect(result).toEqual(updatedApplication);
            expect(mockImageUploadService.deleteApplicationImages).toHaveBeenCalledWith(applicationId, [filename]);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedApplication);
        });

        it('should throw ApplicationNotFoundException when image not found', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'non-existent.jpg';
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);

            // Act & Assert
            await expect(service.deleteImage(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application has no images', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithoutImages = { ...mockApplication, images: null };
            mockCacheService.getOrSet.mockResolvedValue(applicationWithoutImages);

            // Act & Assert
            await expect(service.deleteImage(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('getImagePath', () => {
        it('should return image path', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const imagePath = '/path/to/image1.jpg';
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);
            mockImageUploadService.getImagePath.mockResolvedValue(imagePath);

            // Act
            const result = await service.getImagePath(applicationId, filename);

            // Assert
            expect(result).toBe(imagePath);
            expect(mockImageUploadService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should throw ApplicationNotFoundException when image not found', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'non-existent.jpg';
            mockCacheService.getOrSet.mockResolvedValue(mockApplication);

            // Act & Assert
            await expect(service.getImagePath(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });
    });
});
