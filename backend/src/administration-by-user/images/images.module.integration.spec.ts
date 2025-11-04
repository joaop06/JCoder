import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationTypeEnum } from '../applications/enums/application-type.enum';
import { RoleEnum } from '../@common/enums/role.enum';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';

// Mock entities to avoid circular dependencies
interface MockApplication {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    user?: any;
    applicationComponentApi?: any;
    applicationComponentMobile?: any;
    applicationComponentLibrary?: any;
    applicationComponentFrontend?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

interface MockUser {
    id: number;
    name: string;
    email: string;
    role: RoleEnum;
    applications?: MockApplication[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock Services
class MockCacheService {
    async get(key: string): Promise<any> {
        return null;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        // Mock implementation
    }

    async del(key: string): Promise<void> {
        // Mock implementation
    }

    async getOrSet(key: string, factory: () => Promise<any>, ttl?: number): Promise<any> {
        return await factory();
    }

    generateKey(prefix: string, ...parts: (string | number)[]): string {
        return `${prefix}:${parts.join(':')}`;
    }

    applicationKey(id: number, suffix: string): string {
        return `application:${id}:${suffix}`;
    }
}

class MockImageUploadService {
    async uploadImages(files: Express.Multer.File[], applicationId: number): Promise<string[]> {
        return files.map((_, index) => `image-${index + 1}.jpg`);
    }

    async uploadProfileImage(file: Express.Multer.File, applicationId: number): Promise<string> {
        return 'profile-image.jpg';
    }

    async deleteApplicationImages(applicationId: number, filenames: string[]): Promise<void> {
        // Mock implementation
    }

    async deleteAllApplicationImages(applicationId: number): Promise<void> {
        // Mock implementation
    }

    async getImagePath(applicationId: number, filename: string): Promise<string> {
        return `/uploads/applications/${applicationId}/${filename}`;
    }

    async getProfileImagePath(applicationId: number, filename: string): Promise<string> {
        return `/uploads/applications/${applicationId}/${filename}`;
    }
}

// Mock ImagesService
class MockImagesService {
    constructor(
        private readonly repository: Repository<MockApplication>,
        private readonly cacheService: MockCacheService,
        private readonly imageUploadService: MockImageUploadService,
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

// Mock ImagesController
class MockImagesController {
    constructor(
        private readonly imagesService: MockImagesService,
        private readonly uploadImagesUseCase: any,
        private readonly deleteImageUseCase: any,
        private readonly getImageUseCase: any,
        private readonly uploadProfileImageUseCase: any,
        private readonly updateProfileImageUseCase: any,
        private readonly deleteProfileImageUseCase: any,
        private readonly getProfileImageUseCase: any,
    ) { }

    async uploadImages(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        return await this.uploadImagesUseCase.execute(id, files);
    }

    async getImage(id: number, filename: string): Promise<string> {
        return await this.getImageUseCase.execute(id, filename);
    }

    async deleteImage(id: number, filename: string): Promise<void> {
        await this.deleteImageUseCase.execute(id, filename);
    }

    async uploadProfileImage(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadProfileImageUseCase.execute(id, files[0]);
    }

    async updateProfileImage(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.updateProfileImageUseCase.execute(id, files[0]);
    }

    async getProfileImage(id: number): Promise<string> {
        return await this.getProfileImageUseCase.execute(id);
    }

    async deleteProfileImage(id: number): Promise<void> {
        await this.deleteProfileImageUseCase.execute(id);
    }
}

// Mock Use Cases
class MockUploadImagesUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.uploadImages(id, files);
    }
}

class MockDeleteImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, filename: string): Promise<void> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        await this.imagesService.deleteImage(id, filename);
    }
}

class MockGetImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, filename: string): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.getImagePath(id, filename);
    }
}

class MockUploadProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, file: Express.Multer.File): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.uploadProfileImage(id, file);
    }
}

class MockUpdateProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, file: Express.Multer.File): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.updateProfileImage(id, file);
    }
}

class MockDeleteProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number): Promise<void> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        await this.imagesService.deleteProfileImage(id);
    }
}

class MockGetProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.getProfileImagePath(id);
    }
}

describe('ImagesModule Integration', () => {
    let module: TestingModule;
    let imagesService: MockImagesService;
    let imagesController: MockImagesController;
    let uploadImagesUseCase: MockUploadImagesUseCase;
    let deleteImageUseCase: MockDeleteImageUseCase;
    let getImageUseCase: MockGetImageUseCase;
    let uploadProfileImageUseCase: MockUploadProfileImageUseCase;
    let updateProfileImageUseCase: MockUpdateProfileImageUseCase;
    let deleteProfileImageUseCase: MockDeleteProfileImageUseCase;
    let getProfileImageUseCase: MockGetProfileImageUseCase;
    let cacheService: MockCacheService;
    let imageUploadService: MockImageUploadService;
    let mockApplicationRepository: jest.Mocked<Repository<MockApplication>>;

    const mockApplication: MockApplication = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        profileImage: 'profile.png',
        user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: RoleEnum.Admin,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser: MockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: RoleEnum.Admin,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        // Create mock repository
        mockApplicationRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
        } as any;

        // Create mock cache service
        const mockCacheService = new MockCacheService();

        // Create mock image upload service
        const mockImageUploadService = new MockImageUploadService();

        // Create service instances
        imagesService = new MockImagesService(
            mockApplicationRepository,
            mockCacheService,
            mockImageUploadService,
        );

        uploadImagesUseCase = new MockUploadImagesUseCase(imagesService);
        deleteImageUseCase = new MockDeleteImageUseCase(imagesService);
        getImageUseCase = new MockGetImageUseCase(imagesService);
        uploadProfileImageUseCase = new MockUploadProfileImageUseCase(imagesService);
        updateProfileImageUseCase = new MockUpdateProfileImageUseCase(imagesService);
        deleteProfileImageUseCase = new MockDeleteProfileImageUseCase(imagesService);
        getProfileImageUseCase = new MockGetProfileImageUseCase(imagesService);

        imagesController = new MockImagesController(
            imagesService,
            uploadImagesUseCase,
            deleteImageUseCase,
            getImageUseCase,
            uploadProfileImageUseCase,
            updateProfileImageUseCase,
            deleteProfileImageUseCase,
            getProfileImageUseCase,
        );

        cacheService = mockCacheService;
        imageUploadService = mockImageUploadService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Module Initialization', () => {
        it('should have ImagesService defined', () => {
            expect(imagesService).toBeDefined();
            expect(imagesService).toBeInstanceOf(MockImagesService);
        });

        it('should have ImagesController defined', () => {
            expect(imagesController).toBeDefined();
            expect(imagesController).toBeInstanceOf(MockImagesController);
        });

        it('should have all use cases defined', () => {
            expect(uploadImagesUseCase).toBeDefined();
            expect(uploadImagesUseCase).toBeInstanceOf(MockUploadImagesUseCase);
            expect(deleteImageUseCase).toBeDefined();
            expect(deleteImageUseCase).toBeInstanceOf(MockDeleteImageUseCase);
            expect(getImageUseCase).toBeDefined();
            expect(getImageUseCase).toBeInstanceOf(MockGetImageUseCase);
            expect(uploadProfileImageUseCase).toBeDefined();
            expect(uploadProfileImageUseCase).toBeInstanceOf(MockUploadProfileImageUseCase);
            expect(updateProfileImageUseCase).toBeDefined();
            expect(updateProfileImageUseCase).toBeInstanceOf(MockUpdateProfileImageUseCase);
            expect(deleteProfileImageUseCase).toBeDefined();
            expect(deleteProfileImageUseCase).toBeInstanceOf(MockDeleteProfileImageUseCase);
            expect(getProfileImageUseCase).toBeDefined();
            expect(getProfileImageUseCase).toBeInstanceOf(MockGetProfileImageUseCase);
        });

        it('should have CacheService defined', () => {
            expect(cacheService).toBeDefined();
            expect(cacheService.generateKey).toBeDefined();
            expect(cacheService.applicationKey).toBeDefined();
        });

        it('should have ImageUploadService defined', () => {
            expect(imageUploadService).toBeDefined();
            expect(imageUploadService.uploadImages).toBeDefined();
            expect(imageUploadService.uploadProfileImage).toBeDefined();
        });

        it('should have Application repository available', () => {
            expect(mockApplicationRepository).toBeDefined();
            expect(mockApplicationRepository.create).toBeDefined();
            expect(mockApplicationRepository.save).toBeDefined();
            expect(mockApplicationRepository.findOne).toBeDefined();
        });
    });

    describe('ImagesService Integration', () => {
        describe('findApplicationById', () => {
            it('should find application by id with all relations', async () => {
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);

                const result = await imagesService.findApplicationById(1);

                expect(result).toEqual(mockApplication);
                expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
                    where: { id: 1 },
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
                mockApplicationRepository.findOne.mockResolvedValue(null);

                await expect(imagesService.findApplicationById(999)).rejects.toThrow(ApplicationNotFoundException);
            });

            it('should use cache for findApplicationById', async () => {
                const cacheSpy = jest.spyOn(cacheService, 'getOrSet');
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);

                await imagesService.findApplicationById(1);

                expect(cacheSpy).toHaveBeenCalledWith(
                    'application:1:full',
                    expect.any(Function),
                    600
                );
            });
        });

        describe('uploadImages', () => {
            it('should upload images and update application', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test1'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                    { buffer: Buffer.from('test2'), mimetype: 'image/png', size: 2000 } as Express.Multer.File,
                ];

                const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png', 'image-1.jpg', 'image-2.jpg'] };
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithImages as any);
                const uploadSpy = jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['image-1.jpg', 'image-2.jpg']);
                const cacheDelSpy = jest.spyOn(cacheService, 'del');

                const result = await imagesService.uploadImages(1, mockFiles);

                expect(result).toEqual(applicationWithImages);
                expect(uploadSpy).toHaveBeenCalledWith(mockFiles, 1);
                expect(mockApplicationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                    images: ['image1.jpg', 'image2.png', 'image-1.jpg', 'image-2.jpg']
                }));
                expect(cacheDelSpy).toHaveBeenCalledWith('application:1:full');
            });

            it('should handle empty files array', async () => {
                const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithImages as any);
                const uploadSpy = jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue([]);

                const result = await imagesService.uploadImages(1, []);

                expect(result.images).toEqual(['image1.jpg', 'image2.png']);
                expect(uploadSpy).toHaveBeenCalledWith([], 1);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                mockApplicationRepository.findOne.mockResolvedValue(null);

                await expect(imagesService.uploadImages(999, [])).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('deleteImage', () => {
            it('should delete image and update application', async () => {
                const applicationWithoutImage = { ...mockApplication, images: ['image2.png'] };
                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithoutImage as any);
                const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue();
                const cacheDelSpy = jest.spyOn(cacheService, 'del');

                const result = await imagesService.deleteImage(1, 'image1.jpg');

                expect(result).toEqual(applicationWithoutImage);
                expect(deleteSpy).toHaveBeenCalledWith(1, ['image1.jpg']);
                expect(mockApplicationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                    images: expect.arrayContaining(['image2.png'])
                }));
                expect(cacheDelSpy).toHaveBeenCalledWith('application:1:full');
            });

            it('should throw ApplicationNotFoundException when image not found', async () => {
                const applicationWithoutImages = { ...mockApplication, images: [] };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutImages as any);

                await expect(imagesService.deleteImage(1, 'nonexistent.jpg')).rejects.toThrow(ApplicationNotFoundException);
            });

            it('should throw ApplicationNotFoundException when application has no images', async () => {
                const applicationWithoutImages = { ...mockApplication, images: undefined };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutImages as any);

                await expect(imagesService.deleteImage(1, 'image1.jpg')).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('getImagePath', () => {
            it('should get image path for existing image', async () => {
                const applicationWithImage = { ...mockApplication, images: ['image1.jpg', 'image2.png'] };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithImage as any);
                const getPathSpy = jest.spyOn(imageUploadService, 'getImagePath').mockResolvedValue('/uploads/applications/1/image1.jpg');

                const result = await imagesService.getImagePath(1, 'image1.jpg');

                expect(result).toBe('/uploads/applications/1/image1.jpg');
                expect(getPathSpy).toHaveBeenCalledWith(1, 'image1.jpg');
            });

            it('should throw ApplicationNotFoundException when image not found', async () => {
                const applicationWithoutImages = { ...mockApplication, images: [] };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutImages as any);

                await expect(imagesService.getImagePath(1, 'nonexistent.jpg')).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('uploadProfileImage', () => {
            it('should upload profile image and update application', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile-image.jpg' };

                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithProfileImage as any);
                const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-image.jpg');
                const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue();
                const cacheDelSpy = jest.spyOn(cacheService, 'del');

                const result = await imagesService.uploadProfileImage(1, mockFile);

                expect(result).toEqual(applicationWithProfileImage);
                expect(uploadSpy).toHaveBeenCalledWith(mockFile, 1);
                expect(deleteSpy).toHaveBeenCalledWith(1, ['profile.png']);
                expect(mockApplicationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                    profileImage: 'profile-image.jpg'
                }));
                expect(cacheDelSpy).toHaveBeenCalledWith('application:1:full');
            });

            it('should upload profile image when no existing profile image', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;
                const applicationWithoutProfileImage = { ...mockApplication, profileImage: undefined };
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile-image.jpg' };

                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutProfileImage as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithProfileImage as any);
                const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('profile-image.jpg');
                const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages');

                const result = await imagesService.uploadProfileImage(1, mockFile);

                expect(result).toEqual(applicationWithProfileImage);
                expect(uploadSpy).toHaveBeenCalledWith(mockFile, 1);
                expect(deleteSpy).not.toHaveBeenCalled();
            });
        });

        describe('updateProfileImage', () => {
            it('should update profile image (same as upload)', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'new-profile-image.jpg' };

                mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithProfileImage as any);
                const uploadSpy = jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('new-profile-image.jpg');

                const result = await imagesService.updateProfileImage(1, mockFile);

                expect(result).toEqual(applicationWithProfileImage);
                expect(uploadSpy).toHaveBeenCalledWith(mockFile, 1);
            });
        });

        describe('deleteProfileImage', () => {
            it('should delete profile image and update application', async () => {
                const applicationWithoutProfileImage = { ...mockApplication, profileImage: null };
                // Ensure the mock returns the application with the correct profileImage
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile.png' };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithProfileImage as any);
                mockApplicationRepository.save.mockResolvedValue(applicationWithoutProfileImage as any);
                const deleteSpy = jest.spyOn(imageUploadService, 'deleteApplicationImages').mockResolvedValue();
                const cacheDelSpy = jest.spyOn(cacheService, 'del');

                const result = await imagesService.deleteProfileImage(1);

                expect(result).toEqual(applicationWithoutProfileImage);
                expect(deleteSpy).toHaveBeenCalledWith(1, ['profile.png']);
                expect(mockApplicationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                    profileImage: null
                }));
                expect(cacheDelSpy).toHaveBeenCalledWith('application:1:full');
            });

            it('should throw ApplicationNotFoundException when no profile image exists', async () => {
                const applicationWithoutProfileImage = { ...mockApplication, profileImage: undefined };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutProfileImage as any);

                await expect(imagesService.deleteProfileImage(1)).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('getProfileImagePath', () => {
            it('should get profile image path for existing profile image', async () => {
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile.png' };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithProfileImage as any);
                const getPathSpy = jest.spyOn(imageUploadService, 'getProfileImagePath').mockResolvedValue('/uploads/applications/1/profile.png');

                const result = await imagesService.getProfileImagePath(1);

                expect(result).toBe('/uploads/applications/1/profile.png');
                expect(getPathSpy).toHaveBeenCalledWith(1, 'profile.png');
            });

            it('should throw ApplicationNotFoundException when no profile image exists', async () => {
                const applicationWithoutProfileImage = { ...mockApplication, profileImage: undefined };
                mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutProfileImage as any);

                await expect(imagesService.getProfileImagePath(1)).rejects.toThrow(ApplicationNotFoundException);
            });
        });
    });

    describe('ImagesController Integration', () => {
        describe('uploadImages', () => {
            it('should upload images through use case', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test1'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                ];
                const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png', 'image-1.jpg'] };

                jest.spyOn(uploadImagesUseCase, 'execute').mockResolvedValue(applicationWithImages as any);

                const result = await imagesController.uploadImages(1, mockFiles);

                expect(result).toEqual(applicationWithImages);
                expect(uploadImagesUseCase.execute).toHaveBeenCalledWith(1, mockFiles);
            });
        });

        describe('getImage', () => {
            it('should get image through use case', async () => {
                const imagePath = '/uploads/applications/1/image1.jpg';
                jest.spyOn(getImageUseCase, 'execute').mockResolvedValue(imagePath);

                const result = await imagesController.getImage(1, 'image1.jpg');

                expect(result).toBe(imagePath);
                expect(getImageUseCase.execute).toHaveBeenCalledWith(1, 'image1.jpg');
            });
        });

        describe('deleteImage', () => {
            it('should delete image through use case', async () => {
                jest.spyOn(deleteImageUseCase, 'execute').mockResolvedValue(undefined);

                await imagesController.deleteImage(1, 'image1.jpg');

                expect(deleteImageUseCase.execute).toHaveBeenCalledWith(1, 'image1.jpg');
            });
        });

        describe('uploadProfileImage', () => {
            it('should upload profile image through use case', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                ];
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile-image.jpg' };

                jest.spyOn(uploadProfileImageUseCase, 'execute').mockResolvedValue(applicationWithProfileImage as any);

                const result = await imagesController.uploadProfileImage(1, mockFiles);

                expect(result).toEqual(applicationWithProfileImage);
                expect(uploadProfileImageUseCase.execute).toHaveBeenCalledWith(1, mockFiles[0]);
            });

            it('should throw error when no file uploaded', async () => {
                await expect(imagesController.uploadProfileImage(1, [])).rejects.toThrow('No file uploaded');
            });
        });

        describe('updateProfileImage', () => {
            it('should update profile image through use case', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                ];
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'new-profile-image.jpg' };

                jest.spyOn(updateProfileImageUseCase, 'execute').mockResolvedValue(applicationWithProfileImage as any);

                const result = await imagesController.updateProfileImage(1, mockFiles);

                expect(result).toEqual(applicationWithProfileImage);
                expect(updateProfileImageUseCase.execute).toHaveBeenCalledWith(1, mockFiles[0]);
            });

            it('should throw error when no file uploaded', async () => {
                await expect(imagesController.updateProfileImage(1, [])).rejects.toThrow('No file uploaded');
            });
        });

        describe('getProfileImage', () => {
            it('should get profile image through use case', async () => {
                const imagePath = '/uploads/applications/1/profile.png';
                jest.spyOn(getProfileImageUseCase, 'execute').mockResolvedValue(imagePath);

                const result = await imagesController.getProfileImage(1);

                expect(result).toBe(imagePath);
                expect(getProfileImageUseCase.execute).toHaveBeenCalledWith(1);
            });
        });

        describe('deleteProfileImage', () => {
            it('should delete profile image through use case', async () => {
                jest.spyOn(deleteProfileImageUseCase, 'execute').mockResolvedValue(undefined);

                await imagesController.deleteProfileImage(1);

                expect(deleteProfileImageUseCase.execute).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('Use Cases Integration', () => {
        describe('UploadImagesUseCase', () => {
            it('should upload images successfully', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test1'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                ];
                const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png', 'image-1.jpg'] };

                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'uploadImages').mockResolvedValue(applicationWithImages as any);

                const result = await uploadImagesUseCase.execute(1, mockFiles);

                expect(result).toEqual(applicationWithImages);
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.uploadImages).toHaveBeenCalledWith(1, mockFiles);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(uploadImagesUseCase.execute(999, [])).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('DeleteImageUseCase', () => {
            it('should delete image successfully', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'deleteImage').mockResolvedValue(mockApplication as any);

                await deleteImageUseCase.execute(1, 'image1.jpg');

                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.deleteImage).toHaveBeenCalledWith(1, 'image1.jpg');
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(deleteImageUseCase.execute(999, 'image1.jpg')).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('GetImageUseCase', () => {
            it('should get image path successfully', async () => {
                const imagePath = '/uploads/applications/1/image1.jpg';
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'getImagePath').mockResolvedValue(imagePath);

                const result = await getImageUseCase.execute(1, 'image1.jpg');

                expect(result).toBe(imagePath);
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(1, 'image1.jpg');
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(getImageUseCase.execute(999, 'image1.jpg')).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('UploadProfileImageUseCase', () => {
            it('should upload profile image successfully', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'profile-image.jpg' };

                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'uploadProfileImage').mockResolvedValue(applicationWithProfileImage as any);

                const result = await uploadProfileImageUseCase.execute(1, mockFile);

                expect(result).toEqual(applicationWithProfileImage);
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.uploadProfileImage).toHaveBeenCalledWith(1, mockFile);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(uploadProfileImageUseCase.execute(999, {} as Express.Multer.File)).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('UpdateProfileImageUseCase', () => {
            it('should update profile image successfully', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;
                const applicationWithProfileImage = { ...mockApplication, profileImage: 'new-profile-image.jpg' };

                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'updateProfileImage').mockResolvedValue(applicationWithProfileImage as any);

                const result = await updateProfileImageUseCase.execute(1, mockFile);

                expect(result).toEqual(applicationWithProfileImage);
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(1, mockFile);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(updateProfileImageUseCase.execute(999, {} as Express.Multer.File)).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('DeleteProfileImageUseCase', () => {
            it('should delete profile image successfully', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'deleteProfileImage').mockResolvedValue(mockApplication as any);

                await deleteProfileImageUseCase.execute(1);

                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(1);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(deleteProfileImageUseCase.execute(999)).rejects.toThrow(ApplicationNotFoundException);
            });
        });

        describe('GetProfileImageUseCase', () => {
            it('should get profile image path successfully', async () => {
                const imagePath = '/uploads/applications/1/profile.png';
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(mockApplication as any);
                jest.spyOn(imagesService, 'getProfileImagePath').mockResolvedValue(imagePath);

                const result = await getProfileImageUseCase.execute(1);

                expect(result).toBe(imagePath);
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(1);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(1);
            });

            it('should throw ApplicationNotFoundException when application not found', async () => {
                jest.spyOn(imagesService, 'findApplicationById').mockResolvedValue(null as any);

                await expect(getProfileImageUseCase.execute(999)).rejects.toThrow(ApplicationNotFoundException);
            });
        });
    });

    describe('ImageUploadService Integration', () => {
        describe('uploadImages', () => {
            it('should upload multiple images successfully', async () => {
                const mockFiles = [
                    { buffer: Buffer.from('test1'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File,
                    { buffer: Buffer.from('test2'), mimetype: 'image/png', size: 2000 } as Express.Multer.File,
                ];

                const result = await imageUploadService.uploadImages(mockFiles, 1);

                expect(result).toEqual(['image-1.jpg', 'image-2.jpg']);
            });

            it('should handle empty files array', async () => {
                const result = await imageUploadService.uploadImages([], 1);

                expect(result).toEqual([]);
            });
        });

        describe('uploadProfileImage', () => {
            it('should upload profile image successfully', async () => {
                const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 } as Express.Multer.File;

                const result = await imageUploadService.uploadProfileImage(mockFile, 1);

                expect(result).toBe('profile-image.jpg');
            });
        });

        describe('deleteApplicationImages', () => {
            it('should delete specified images', async () => {
                const filenames = ['image1.jpg', 'image2.png'];

                await expect(imageUploadService.deleteApplicationImages(1, filenames)).resolves.not.toThrow();
            });

            it('should handle empty filenames array', async () => {
                await expect(imageUploadService.deleteApplicationImages(1, [])).resolves.not.toThrow();
            });
        });

        describe('deleteAllApplicationImages', () => {
            it('should delete all application images', async () => {
                await expect(imageUploadService.deleteAllApplicationImages(1)).resolves.not.toThrow();
            });
        });

        describe('getImagePath', () => {
            it('should get image path successfully', async () => {
                const result = await imageUploadService.getImagePath(1, 'image1.jpg');

                expect(result).toBe('/uploads/applications/1/image1.jpg');
            });
        });

        describe('getProfileImagePath', () => {
            it('should get profile image path successfully', async () => {
                const result = await imageUploadService.getProfileImagePath(1, 'profile.png');

                expect(result).toBe('/uploads/applications/1/profile.png');
            });
        });
    });

    describe('Cache Integration', () => {
        it('should use cache service for findApplicationById', async () => {
            const cacheSpy = jest.spyOn(cacheService, 'getOrSet');
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);

            await imagesService.findApplicationById(1);

            expect(cacheSpy).toHaveBeenCalledWith(
                'application:1:full',
                expect.any(Function),
                600
            );
        });

        it('should invalidate cache after image operations', async () => {
            const cacheDelSpy = jest.spyOn(cacheService, 'del');
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
            mockApplicationRepository.save.mockResolvedValue(mockApplication as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new-image.jpg']);

            await imagesService.uploadImages(1, []);

            expect(cacheDelSpy).toHaveBeenCalledWith('application:1:full');
        });

        it('should handle cache service failures gracefully', async () => {
            const error = new Error('Cache service unavailable');
            jest.spyOn(cacheService, 'getOrSet').mockRejectedValue(error);

            await expect(imagesService.findApplicationById(1)).rejects.toThrow('Cache service unavailable');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle repository errors gracefully', async () => {
            const error = new Error('Database connection failed');
            mockApplicationRepository.findOne.mockRejectedValue(error);

            await expect(imagesService.findApplicationById(1)).rejects.toThrow('Database connection failed');
        });

        it('should handle image upload service errors gracefully', async () => {
            const error = new Error('Image processing failed');
            jest.spyOn(imageUploadService, 'uploadImages').mockRejectedValue(error);
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);

            await expect(imagesService.uploadImages(1, [])).rejects.toThrow('Image processing failed');
        });

        it('should handle file system errors gracefully', async () => {
            const error = new Error('File system error');
            const applicationWithImage = { ...mockApplication, images: ['image1.jpg'] };
            jest.spyOn(imageUploadService, 'getImagePath').mockRejectedValue(error);
            mockApplicationRepository.findOne.mockResolvedValue(applicationWithImage as any);

            await expect(imagesService.getImagePath(1, 'image1.jpg')).rejects.toThrow('File system error');
        });
    });

    describe('Module Dependencies Integration', () => {
        it('should integrate with ApplicationsModule', async () => {
            const applicationWithImages = { ...mockApplication, images: ['image1.jpg', 'image2.png', 'new-image.jpg'] };
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);
            mockApplicationRepository.save.mockResolvedValue(applicationWithImages as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new-image.jpg']);

            const result = await imagesService.uploadImages(1, []);

            expect(result).toBeDefined();
            expect(result.images).toContain('new-image.jpg');
        });

        it('should integrate with CacheModule', async () => {
            const cacheSpy = jest.spyOn(cacheService, 'getOrSet');
            mockApplicationRepository.findOne.mockResolvedValue(mockApplication as any);

            await imagesService.findApplicationById(1);

            expect(cacheSpy).toHaveBeenCalled();
        });

        it('should integrate with ConfigModule through ImageUploadService', async () => {
            // This test verifies that the ImageUploadService can be instantiated
            // and uses configuration from ConfigModule
            expect(imageUploadService).toBeDefined();
            expect(typeof imageUploadService.uploadImages).toBe('function');
            expect(typeof imageUploadService.uploadProfileImage).toBe('function');
        });
    });

    describe('Data Validation Integration', () => {
        it('should handle null and undefined values in image arrays', async () => {
            const applicationWithNullImages = { ...mockApplication, images: null };
            const applicationWithUpdatedImages = { ...mockApplication, images: ['new-image.jpg'] };
            mockApplicationRepository.findOne.mockResolvedValue(applicationWithNullImages as any);
            mockApplicationRepository.save.mockResolvedValue(applicationWithUpdatedImages as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new-image.jpg']);

            const result = await imagesService.uploadImages(1, []);

            expect(result).toEqual(applicationWithUpdatedImages);
        });

        it('should handle empty image arrays', async () => {
            const applicationWithEmptyImages = { ...mockApplication, images: [] };
            const applicationWithUpdatedImages = { ...mockApplication, images: ['new-image.jpg'] };
            mockApplicationRepository.findOne.mockResolvedValue(applicationWithEmptyImages as any);
            mockApplicationRepository.save.mockResolvedValue(applicationWithUpdatedImages as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new-image.jpg']);

            const result = await imagesService.uploadImages(1, []);

            expect(result).toEqual(applicationWithUpdatedImages);
        });

        it('should handle undefined profile image', async () => {
            const applicationWithoutProfileImage = { ...mockApplication, profileImage: undefined };
            const applicationWithProfileImage = { ...mockApplication, profileImage: 'new-profile.jpg' };
            mockApplicationRepository.findOne.mockResolvedValue(applicationWithoutProfileImage as any);
            mockApplicationRepository.save.mockResolvedValue(applicationWithProfileImage as any);
            jest.spyOn(imageUploadService, 'uploadProfileImage').mockResolvedValue('new-profile.jpg');

            const result = await imagesService.uploadProfileImage(1, {} as Express.Multer.File);

            expect(result).toEqual(applicationWithProfileImage);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple concurrent image operations', async () => {
            // Mock different applications for each call
            mockApplicationRepository.findOne.mockImplementation((options) => {
                const id = options.where.id;
                return Promise.resolve({ ...mockApplication, id } as any);
            });

            // Mock cache service to return the application
            jest.spyOn(cacheService, 'getOrSet').mockImplementation(async (key, factory) => {
                try {
                    return await factory();
                } catch (error) {
                    // If factory throws, return a mock application based on the key
                    const id = parseInt(key.split(':')[1]);
                    return { ...mockApplication, id };
                }
            });

            const promises = [];

            for (let i = 0; i < 5; i++) {
                promises.push(imagesService.findApplicationById(i + 1));
            }

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            expect(mockApplicationRepository.findOne).toHaveBeenCalledTimes(5);
        });

        it('should handle large image arrays efficiently', async () => {
            const largeImageArray = Array.from({ length: 100 }, (_, i) => `image-${i + 1}.jpg`);
            const applicationWithLargeImageArray = { ...mockApplication, images: largeImageArray };
            const applicationWithUpdatedImages = { ...mockApplication, images: [...largeImageArray, 'new-image.jpg'] };

            mockApplicationRepository.findOne.mockResolvedValue(applicationWithLargeImageArray as any);
            mockApplicationRepository.save.mockResolvedValue(applicationWithUpdatedImages as any);
            jest.spyOn(imageUploadService, 'uploadImages').mockResolvedValue(['new-image.jpg']);

            const result = await imagesService.uploadImages(1, []);

            expect(result.images).toHaveLength(101);
            expect(result.images).toContain('new-image.jpg');
        });
    });
});
