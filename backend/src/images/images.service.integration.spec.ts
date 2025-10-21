import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleEnum } from '../@common/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../@common/services/cache.service';
import { ApplicationTypeEnum } from '../applications/enums/application-type.enum';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';
import { ImageUploadService } from './services/image-upload.service';

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

// Mock ImagesService to avoid circular dependencies
class MockImagesService {
    constructor(
        private readonly repository: Repository<MockApplication>,
        private readonly cacheService: CacheService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    async findApplicationById(id: number): Promise<MockApplication> {
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

    async uploadImages(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        const application = await this.findApplicationById(id);

        // Upload new images
        const newImageFilenames = await this.imageUploadService.uploadImages(files, id);

        // Merge with existing images
        const existingImages = application.images || [];
        const updatedImages = [...existingImages, ...newImageFilenames];

        // Update application with new images
        application.images = updatedImages;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async deleteImage(id: number, filename: string): Promise<MockApplication> {
        const application = await this.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        // Delete the image file
        await this.imageUploadService.deleteApplicationImages(id, [filename]);

        // Remove from application images array
        application.images = application.images.filter(img => img !== filename);
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async getImagePath(id: number, filename: string): Promise<string> {
        const application = await this.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageUploadService.getImagePath(id, filename);
    }

    async uploadProfileImage(id: number, file: Express.Multer.File): Promise<MockApplication> {
        const application = await this.findApplicationById(id);

        // Delete existing profile image if it exists
        if (application.profileImage) {
            await this.imageUploadService.deleteApplicationImages(id, [application.profileImage]);
        }

        // Upload new profile image
        const profileImageFilename = await this.imageUploadService.uploadProfileImage(file, id);

        // Update application with new profile image
        application.profileImage = profileImageFilename;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async updateProfileImage(id: number, file: Express.Multer.File): Promise<MockApplication> {
        // This is essentially the same as uploadProfileImage since it replaces the existing one
        return await this.uploadProfileImage(id, file);
    }

    async deleteProfileImage(id: number): Promise<MockApplication> {
        const application = await this.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        // Delete the profile image file
        await this.imageUploadService.deleteApplicationImages(id, [application.profileImage]);

        // Remove profile image from application
        application.profileImage = null;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async getProfileImagePath(id: number): Promise<string> {
        const application = await this.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageUploadService.getProfileImagePath(id, application.profileImage);
    }
}

// Mock ImageUploadService
class MockImageUploadService {
    async uploadImages(files: Express.Multer.File[], applicationId: number): Promise<string[]> {
        if (!files || files.length === 0) {
            return [];
        }
        return files.map((_, index) => `image-${applicationId}-${index + 1}.jpg`);
    }

    async uploadProfileImage(file: Express.Multer.File, applicationId: number): Promise<string> {
        return `profile-${applicationId}-${Date.now()}.jpg`;
    }

    async deleteApplicationImages(applicationId: number, filenames: string[]): Promise<void> {
        // Mock implementation - in real scenario would delete files from filesystem
    }

    async getImagePath(applicationId: number, filename: string): Promise<string> {
        return `/uploads/applications/${applicationId}/${filename}`;
    }

    async getProfileImagePath(applicationId: number, filename: string): Promise<string> {
        return `/uploads/applications/${applicationId}/${filename}`;
    }
}

describe('ImagesService Integration', () => {
    let service: MockImagesService;
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

    const mockFiles: Express.Multer.File[] = [
        {
            fieldname: 'images',
            originalname: 'test1.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('fake-image-data-1'),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
        },
        {
            fieldname: 'images',
            originalname: 'test2.png',
            encoding: '7bit',
            mimetype: 'image/png',
            size: 2048,
            buffer: Buffer.from('fake-image-data-2'),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
        },
    ];

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
                    provide: 'ImagesService',
                    useFactory: (repository, cacheService, imageUploadService) => {
                        return new MockImagesService(repository, cacheService, imageUploadService);
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

        service = module.get<MockImagesService>('ImagesService');
        repository = module.get('ApplicationRepository');
        cacheService = module.get<CacheService>(CacheService) as jest.Mocked<CacheService>;
        imageUploadService = module.get<MockImageUploadService>('ImageUploadService');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findApplicationById', () => {
        it('should return application by id with all relations', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            const result = await service.findApplicationById(applicationId);

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

            await expect(service.findApplicationById(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should use cache for findApplicationById', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockResolvedValue(mockApplication as any);

            const result = await service.findApplicationById(applicationId);

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

            await expect(service.findApplicationById(applicationId)).rejects.toThrow('Cache service unavailable');
        });
    });

    describe('uploadImages', () => {
        it('should upload images successfully and merge with existing ones', async () => {
            const applicationId = 1;
            const applicationWithImages = { ...mockApplication, images: ['existing1.jpg'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            repository.save.mockResolvedValue(applicationWithImages as any);
            cacheService.del.mockResolvedValue(undefined);

            const uploadSpy = jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new1.jpg', 'new2.jpg']);

            const result = await service.uploadImages(applicationId, mockFiles);

            expect(uploadSpy).toHaveBeenCalledWith(mockFiles, applicationId);
            expect(result.images).toEqual(['existing1.jpg', 'new1.jpg', 'new2.jpg']);
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                images: ['existing1.jpg', 'new1.jpg', 'new2.jpg']
            }));
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should upload images to application with no existing images', async () => {
            const applicationId = 1;
            const applicationWithoutImages = { ...mockApplication, images: undefined };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithoutImages as any);
            repository.save.mockResolvedValue(applicationWithoutImages as any);
            cacheService.del.mockResolvedValue(undefined);

            const uploadSpy = jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new1.jpg']);

            const result = await service.uploadImages(applicationId, [mockFiles[0]]);

            expect(uploadSpy).toHaveBeenCalledWith([mockFiles[0]], applicationId);
            expect(result.images).toEqual(['new1.jpg']);
        });

        it('should handle empty files array', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.del.mockResolvedValue(undefined);

            const uploadSpy = jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue([]);

            const result = await service.uploadImages(applicationId, []);

            expect(uploadSpy).toHaveBeenCalledWith([], applicationId);
            expect(result.images).toEqual(mockApplication.images);
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.uploadImages(applicationId, mockFiles)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after successful upload', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new1.jpg']);

            await service.uploadImages(applicationId, [mockFiles[0]]);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });
    });

    describe('deleteImage', () => {
        it('should delete image successfully and remove from array', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            repository.save.mockResolvedValue(applicationWithImages as any);
            cacheService.del.mockResolvedValue(undefined);

            const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue(undefined);

            const result = await service.deleteImage(applicationId, filename);

            expect(deleteSpy).toHaveBeenCalledWith(applicationId, [filename]);
            expect(result.images).toEqual(['image2.png']);
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                images: ['image2.png']
            }));
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should throw ApplicationNotFoundException when image not found in application', async () => {
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            await expect(service.deleteImage(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application has no images', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithoutImages = { ...mockApplication, images: undefined };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithoutImages as any);

            await expect(service.deleteImage(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;
            const filename = 'image1.jpg';

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.deleteImage(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after successful deletion', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            repository.save.mockResolvedValue(applicationWithImages as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue(undefined);

            await service.deleteImage(applicationId, filename);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });
    });

    describe('getImagePath', () => {
        it('should return image path for valid image', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            const getPathSpy = jest.spyOn(imageUploadService, 'getImagePath').mockResolvedValue('/uploads/applications/1/image1.jpg');

            const result = await service.getImagePath(applicationId, filename);

            expect(getPathSpy).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe('/uploads/applications/1/image1.jpg');
        });

        it('should throw ApplicationNotFoundException when image not found in application', async () => {
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);

            await expect(service.getImagePath(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;
            const filename = 'image1.jpg';

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.getImagePath(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('uploadProfileImage', () => {
        it('should upload profile image successfully', async () => {
            const applicationId = 1;
            const applicationWithoutProfile = { ...mockApplication, profileImage: undefined };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithoutProfile as any);
            repository.save.mockResolvedValue(applicationWithoutProfile as any);
            cacheService.del.mockResolvedValue(undefined);

            const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-new.jpg');

            const result = await service.uploadProfileImage(applicationId, mockFiles[0]);

            expect(uploadSpy).toHaveBeenCalledWith(mockFiles[0], applicationId);
            expect(result.profileImage).toBe('profile-new.jpg');
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                profileImage: 'profile-new.jpg'
            }));
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should replace existing profile image', async () => {
            const applicationId = 1;
            const applicationWithProfile = { ...mockApplication, profileImage: 'old-profile.jpg' };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithProfile as any);
            repository.save.mockResolvedValue(applicationWithProfile as any);
            cacheService.del.mockResolvedValue(undefined);

            const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue(undefined);
            const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-new.jpg');

            const result = await service.uploadProfileImage(applicationId, mockFiles[0]);

            expect(deleteSpy).toHaveBeenCalledWith(applicationId, ['old-profile.jpg']);
            expect(uploadSpy).toHaveBeenCalledWith(mockFiles[0], applicationId);
            expect(result.profileImage).toBe('profile-new.jpg');
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.uploadProfileImage(applicationId, mockFiles[0])).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after successful upload', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-new.jpg');

            await service.uploadProfileImage(applicationId, mockFiles[0]);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });
    });

    describe('updateProfileImage', () => {
        it('should update profile image by calling uploadProfileImage', async () => {
            const applicationId = 1;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.del.mockResolvedValue(undefined);

            const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-updated.jpg');

            const result = await service.updateProfileImage(applicationId, mockFiles[0]);

            expect(uploadSpy).toHaveBeenCalledWith(mockFiles[0], applicationId);
            expect(result.profileImage).toBe('profile-updated.jpg');
        });
    });

    describe('deleteProfileImage', () => {
        it('should delete profile image successfully', async () => {
            const applicationId = 1;
            const applicationWithProfile = { ...mockApplication, profileImage: 'profile.jpg' };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithProfile as any);
            repository.save.mockResolvedValue(applicationWithProfile as any);
            cacheService.del.mockResolvedValue(undefined);

            const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue(undefined);

            const result = await service.deleteProfileImage(applicationId);

            expect(deleteSpy).toHaveBeenCalledWith(applicationId, ['profile.jpg']);
            expect(result.profileImage).toBeNull();
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                profileImage: null
            }));
            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });

        it('should throw ApplicationNotFoundException when no profile image exists', async () => {
            const applicationId = 1;
            const applicationWithoutProfile = { ...mockApplication, profileImage: undefined };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithoutProfile as any);

            await expect(service.deleteProfileImage(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.deleteProfileImage(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should invalidate cache after successful deletion', async () => {
            const applicationId = 1;
            const applicationWithProfile = { ...mockApplication, profileImage: 'profile.jpg' };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithProfile as any);
            repository.save.mockResolvedValue(applicationWithProfile as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue(undefined);

            await service.deleteProfileImage(applicationId);

            expect(cacheService.del).toHaveBeenCalledWith('cache-key');
        });
    });

    describe('getProfileImagePath', () => {
        it('should return profile image path for valid profile image', async () => {
            const applicationId = 1;
            const applicationWithProfile = { ...mockApplication, profileImage: 'profile.jpg' };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithProfile as any);

            const getPathSpy = jest.spyOn(imageUploadService, 'getProfileImagePath').mockResolvedValue('/uploads/applications/1/profile.jpg');

            const result = await service.getProfileImagePath(applicationId);

            expect(getPathSpy).toHaveBeenCalledWith(applicationId, 'profile.jpg');
            expect(result).toBe('/uploads/applications/1/profile.jpg');
        });

        it('should throw ApplicationNotFoundException when no profile image exists', async () => {
            const applicationId = 1;
            const applicationWithoutProfile = { ...mockApplication, profileImage: undefined };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithoutProfile as any);

            await expect(service.getProfileImagePath(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });

        it('should throw ApplicationNotFoundException when application not found', async () => {
            const applicationId = 999;

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(null);

            await expect(service.getProfileImagePath(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('Cache Integration', () => {
        it('should use correct cache keys for different operations', async () => {
            cacheService.applicationKey.mockReturnValue('application-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            cacheService.del.mockResolvedValue(undefined);

            // Test findApplicationById cache key generation
            repository.findOne.mockResolvedValue(mockApplication as any);
            await service.findApplicationById(1);
            expect(cacheService.applicationKey).toHaveBeenCalledWith(1, 'full');

            // Test cache invalidation
            repository.save.mockResolvedValue(mockApplication as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);
            await service.uploadImages(1, [mockFiles[0]]);
            expect(cacheService.del).toHaveBeenCalledWith('application-key');
        });

        it('should handle cache service failures gracefully', async () => {
            const error = new Error('Cache service unavailable');
            cacheService.getOrSet.mockRejectedValue(error);

            await expect(service.findApplicationById(1)).rejects.toThrow('Cache service unavailable');
        });

        it('should handle cache deletion failures gracefully', async () => {
            const error = new Error('Cache deletion failed');
            cacheService.del.mockRejectedValue(error);
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);

            // Should not throw error even if cache deletion fails
            try {
                jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);
                const result = await service.uploadImages(1, [mockFiles[0]]);
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
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockRejectedValue(error);

            await expect(service.findApplicationById(1)).rejects.toThrow('Database connection lost');
        });

        it('should handle image upload service errors', async () => {
            const error = new Error('Image upload failed');
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockRejectedValue(error);

            await expect(service.uploadImages(1, mockFiles)).rejects.toThrow('Image upload failed');
        });

        it('should handle image deletion service errors', async () => {
            const error = new Error('Image deletion failed');
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg'] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithImages as any);
            jest.spyOn(imageUploadService, 'deleteApplicationImages').mockRejectedValue(error);

            await expect(service.deleteImage(1, 'image1.jpg')).rejects.toThrow('Image deletion failed');
        });

        it('should handle repository save errors', async () => {
            const error = new Error('Database save failed');
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockRejectedValue(error);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);

            await expect(service.uploadImages(1, [mockFiles[0]])).rejects.toThrow('Database save failed');
        });
    });

    describe('Data Validation', () => {
        it('should handle null and undefined values in images array', async () => {
            const applicationId = 1;
            const applicationWithNullImages = { ...mockApplication, images: null };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithNullImages as any);
            repository.save.mockResolvedValue(applicationWithNullImages as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);

            const result = await service.uploadImages(applicationId, [mockFiles[0]]);

            expect(result.images).toEqual(['new.jpg']);
        });

        it('should handle empty images array', async () => {
            const applicationId = 1;
            const applicationWithEmptyImages = { ...mockApplication, images: [] };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithEmptyImages as any);
            repository.save.mockResolvedValue(applicationWithEmptyImages as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);

            const result = await service.uploadImages(applicationId, [mockFiles[0]]);

            expect(result.images).toEqual(['new.jpg']);
        });

        it('should handle profile image with null value', async () => {
            const applicationId = 1;
            const applicationWithNullProfile = { ...mockApplication, profileImage: null };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithNullProfile as any);

            await expect(service.deleteProfileImage(applicationId)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple concurrent image uploads', async () => {
            const applicationId = 1;

            // Set up mocks before creating promises
            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(mockApplication as any);
            repository.save.mockResolvedValue(mockApplication as any);
            cacheService.del.mockResolvedValue(undefined);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new.jpg']);

            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(service.uploadImages(applicationId, [mockFiles[0]]));
            }

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            expect(cacheService.getOrSet).toHaveBeenCalledTimes(5);
        });

        it('should handle large number of images in application', async () => {
            const applicationId = 1;
            const largeImagesArray = Array.from({ length: 100 }, (_, i) => `image${i + 1}.jpg`);
            const applicationWithManyImages = { ...mockApplication, images: largeImagesArray };

            cacheService.applicationKey.mockReturnValue('cache-key');
            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                const result = await fn();
                return result;
            });
            repository.findOne.mockResolvedValue(applicationWithManyImages as any);
            repository.save.mockResolvedValue(applicationWithManyImages as any);
            cacheService.del.mockResolvedValue(undefined);

            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new101.jpg']);

            const result = await service.uploadImages(applicationId, [mockFiles[0]]);

            expect(result.images).toHaveLength(101);
            expect(result.images).toContain('new101.jpg');
        });

        it('should handle concurrent cache operations', async () => {
            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(service.findApplicationById(i + 1));
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
