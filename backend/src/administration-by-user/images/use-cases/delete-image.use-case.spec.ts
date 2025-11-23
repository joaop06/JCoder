import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { DeleteImageUseCase } from './delete-image.use-case';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

jest.mock('../../applications/entities/application.entity', () => ({
    Application: class Application {},
}));

// Mock do uuid antes de importar ImageStorageService
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
}));

// Mock dos serviços antes de importar
jest.mock('../../../@common/services/cache.service', () => ({
    CacheService: jest.fn().mockImplementation(() => ({
        applicationKey: jest.fn(),
        getOrSet: jest.fn(),
        del: jest.fn(),
    })),
}));

jest.mock('../services/image-storage.service', () => ({
    ImageStorageService: jest.fn().mockImplementation(() => ({
        deleteImage: jest.fn(),
    })),
}));

jest.mock('../images.service', () => ({
    ImagesService: jest.fn().mockImplementation(() => ({
        findApplicationById: jest.fn(),
    })),
}));

import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { ImagesService } from '../images.service';
import { Application } from '../../applications/entities/application.entity';

// Mock das entidades para evitar dependências circulares
class Application {}

describe('DeleteImageUseCase', () => {
    let useCase: DeleteImageUseCase;
    let cacheService: CacheService;
    let imageStorageService: ImageStorageService;
    let imagesService: ImagesService;
    let applicationRepository: Repository<Application>;

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
        user: { username: 'user1' } as any,
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        images: ['image4.jpg', 'image5.jpg'],
        user: { username: 'user2' } as any,
    };

    beforeEach(async () => {
        const mockApplicationRepository = {
            save: jest.fn(),
        };

        const mockImageStorageService = {
            deleteImage: jest.fn(),
        };

        const mockCacheService = {
            applicationKey: jest.fn((id: number, type: string) => `app:${id}:${type}`),
            del: jest.fn(),
        };

        const mockImagesService = {
            findApplicationById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteImageUseCase,
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
                {
                    provide: ImagesService,
                    useValue: mockImagesService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteImageUseCase>(DeleteImageUseCase);
        applicationRepository = module.get<Repository<Application>>(getRepositoryToken(Application));
        imageStorageService = module.get<ImageStorageService>(ImageStorageService);
        cacheService = module.get<CacheService>(CacheService);
        imagesService = module.get<ImagesService>(ImagesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete image successfully', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';
            const updatedApplication = {
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            };

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            (applicationRepository.save as jest.Mock).mockResolvedValue(updatedApplication as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imageStorageService.deleteImage as jest.Mock).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                filename,
                undefined,
                'user1',
            );
            expect(applicationRepository.save as jest.Mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: ['image1.jpg', 'image3.jpg'],
                }),
            );
            expect(cacheService.del as jest.Mock).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });

        it('should throw ApplicationNotFoundException when image does not exist in array', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.deleteImage as jest.Mock).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application has no images', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithoutImages = {
                ...mockApplication1,
                images: null as any,
            };

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(applicationWithoutImages as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;
            const filename = 'image1.jpg';

            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                if (typeof fn === 'function') {
                    const result = await fn();
                    return result;
                }
                return null;
            });

            applicationRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });

        it('should ensure user segmentation - multiple users deleting images simultaneously', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1Filename = 'image2.jpg';
            const user2Filename = 'image4.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            applicationRepository.save
                .mockResolvedValueOnce({
                    ...mockApplication1,
                    images: ['image1.jpg', 'image3.jpg'],
                } as Application)
                .mockResolvedValueOnce({
                    ...mockApplication2,
                    images: ['image5.jpg'],
                } as Application);

            // Act
            await useCase.execute(user1ApplicationId, user1Filename);
            await useCase.execute(user2ApplicationId, user2Filename);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                user1Filename,
                undefined,
                'user1',
            );
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                2,
                ResourceType.Application,
                user2ApplicationId,
                user2Filename,
                undefined,
                'user2',
            );
        });

        it('should ensure that only the correct user\'s image is deleted', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user1Filename = 'image2.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            (applicationRepository.save as jest.Mock).mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(user1ApplicationId, user1Filename);

            // Assert
            expect(imageStorageService.deleteImage as jest.Mock).toHaveBeenCalledWith(
                ResourceType.Application,
                user1ApplicationId,
                user1Filename,
                undefined,
                'user1',
            );
            // Verify that it was not called with user2's data
            expect(imageStorageService.deleteImage).not.toHaveBeenCalledWith(
                ResourceType.Application,
                2,
                expect.any(String),
                undefined,
                'user2',
            );
        });

        it('should remove only the specified image from array', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            (applicationRepository.save as jest.Mock).mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(applicationRepository.save as jest.Mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: expect.arrayContaining(['image1.jpg', 'image3.jpg']),
                }),
            );
            const savedApplication = (applicationRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedApplication.images).not.toContain('image2.jpg');
            expect(savedApplication.images).toHaveLength(2);
        });

        it('should invalidate cache after deleting image', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            (applicationRepository.save as jest.Mock).mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(cacheService.del as jest.Mock).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });
    });
});

