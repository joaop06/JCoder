import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { UploadImagesUseCase } from './upload-images.use-case';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

describe('UploadImagesUseCase', () => {
    let useCase: UploadImagesUseCase;
    let cacheService: jest.Mocked<CacheService>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let applicationRepository: jest.Mocked<Repository<Application>>;

    const mockFile1: Express.Multer.File = {
        fieldname: 'images',
        originalname: 'image1.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data-1'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    const mockFile2: Express.Multer.File = {
        fieldname: 'images',
        originalname: 'image2.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 2048,
        buffer: Buffer.from('fake-image-data-2'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        images: ['existing-image.jpg'],
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        images: [],
    };

    beforeEach(async () => {
        const mockApplicationRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            uploadImages: jest.fn(),
        };

        const mockCacheService = {
            applicationKey: jest.fn((id: number, type: string) => `app:${id}:${type}`),
            getOrSet: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadImagesUseCase,
                {
                    provide: getRepositoryToken(Application),
                    useValue: mockApplicationRepository,
                },
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService,
                },
            ],
        }).compile();

        useCase = module.get<UploadImagesUseCase>(UploadImagesUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should upload multiple images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile1, mockFile2];
            const newFilenames = ['new-image-1.jpg', 'new-image-2.jpg'];
            const updatedApplication = {
                ...mockApplication1,
                images: ['existing-image.jpg', ...newFilenames],
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.uploadImages.mockResolvedValue(newFilenames);
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imageStorageService.uploadImages).toHaveBeenCalledWith(
                files,
                ResourceType.Application,
                applicationId,
                ImageType.Gallery,
                undefined,
                'user1',
            );
            expect(applicationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: ['existing-image.jpg', ...newFilenames],
                }),
            );
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
            expect(result.images).toEqual(['existing-image.jpg', ...newFilenames]);
        });

        it('should upload images to application without existing images', async () => {
            // Arrange
            const applicationId = 2;
            const files = [mockFile1];
            const newFilenames = ['first-image.jpg'];
            const updatedApplication = {
                ...mockApplication2,
                images: newFilenames,
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication2 as Application);
            imageStorageService.uploadImages.mockResolvedValue(newFilenames);
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(result.images).toEqual(newFilenames);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;
            const files = [mockFile1];

            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                if (typeof fn === 'function') {
                    const result = await fn();
                    return result;
                }
                return null;
            });

            applicationRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.uploadImages).not.toHaveBeenCalled();
        });

        it('should ensure user segmentation - multiple users uploading simultaneously', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1Files = [mockFile1];
            const user2Files = [mockFile2];
            const user1Filenames = ['user1-image.jpg'];
            const user2Filenames = ['user2-image.jpg'];

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.uploadImages
                .mockResolvedValueOnce(user1Filenames)
                .mockResolvedValueOnce(user2Filenames);

            applicationRepository.save
                .mockResolvedValueOnce({
                    ...mockApplication1,
                    images: [...(mockApplication1.images || []), ...user1Filenames],
                } as Application)
                .mockResolvedValueOnce({
                    ...mockApplication2,
                    images: user2Filenames,
                } as Application);

            // Act
            const result1 = await useCase.execute(user1ApplicationId, user1Files);
            const result2 = await useCase.execute(user2ApplicationId, user2Files);

            // Assert
            expect(imageStorageService.uploadImages).toHaveBeenNthCalledWith(
                1,
                user1Files,
                ResourceType.Application,
                user1ApplicationId,
                ImageType.Gallery,
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImages).toHaveBeenNthCalledWith(
                2,
                user2Files,
                ResourceType.Application,
                user2ApplicationId,
                ImageType.Gallery,
                undefined,
                'user2',
            );
            expect(result1.images).toContain('user1-image.jpg');
            expect(result2.images).toContain('user2-image.jpg');
            expect(result1.images).not.toContain('user2-image.jpg');
            expect(result2.images).not.toContain('user1-image.jpg');
        });

        it('should keep existing images when adding new ones', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile1];
            const newFilenames = ['new-image.jpg'];
            const existingImages = ['existing-1.jpg', 'existing-2.jpg'];
            const applicationWithImages = {
                ...mockApplication1,
                images: existingImages,
            };
            const updatedApplication = {
                ...applicationWithImages,
                images: [...existingImages, ...newFilenames],
            };

            cacheService.getOrSet.mockResolvedValue(applicationWithImages as Application);
            imageStorageService.uploadImages.mockResolvedValue(newFilenames);
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(result.images).toHaveLength(3);
            expect(result.images).toContain('existing-1.jpg');
            expect(result.images).toContain('existing-2.jpg');
            expect(result.images).toContain('new-image.jpg');
        });

        it('should invalidate cache after uploading', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile1];
            const newFilenames = ['new-image.jpg'];

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.uploadImages.mockResolvedValue(newFilenames);
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                images: [...(mockApplication1.images || []), ...newFilenames],
            } as Application);

            // Act
            await useCase.execute(applicationId, files);

            // Assert
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });
    });
});

