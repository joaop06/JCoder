import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { GetImageUseCase } from './get-image.use-case';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

describe('GetImageUseCase', () => {
    let useCase: GetImageUseCase;
    let applicationRepository: jest.Mocked<Repository<Application>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let cacheService: jest.Mocked<CacheService>;

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        images: ['image1.jpg', 'image2.jpg'],
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        images: ['image3.jpg', 'image4.jpg'],
    };

    beforeEach(async () => {
        const mockApplicationRepository = {
            findOne: jest.fn(),
        };

        const mockImageStorageService = {
            getImagePath: jest.fn(),
        };

        const mockCacheService = {
            applicationKey: jest.fn((id: number, type: string) => `app:${id}:${type}`),
            getOrSet: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetImageUseCase,
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

        useCase = module.get<GetImageUseCase>(GetImageUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return image path successfully', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const expectedImagePath = '/path/to/user1/applications/1/image1.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                filename,
                undefined,
                'user1',
            );
            expect(result).toBe(expectedImagePath);
        });

        it('should throw ApplicationNotFoundException when image does not exist in images array', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application has no images', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const applicationWithoutImages = {
                ...mockApplication1,
                images: null as any,
            };

            cacheService.getOrSet.mockResolvedValue(applicationWithoutImages as Application);

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

        it('should ensure user segmentation - multiple users fetching images', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1Filename = 'image1.jpg';
            const user2Filename = 'image3.jpg';
            const user1ImagePath = '/path/to/user1/applications/1/image1.jpg';
            const user2ImagePath = '/path/to/user2/applications/2/image3.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.getImagePath
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1ApplicationId, user1Filename);
            const result2 = await useCase.execute(user2ApplicationId, user2Filename);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                user1Filename,
                undefined,
                'user1',
            );
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                2,
                ResourceType.Application,
                user2ApplicationId,
                user2Filename,
                undefined,
                'user2',
            );
            expect(result1).toBe(user1ImagePath);
            expect(result2).toBe(user2ImagePath);
            expect(result1).not.toBe(result2);
        });

        it('should ensure that user cannot access another user\'s image', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2Filename = 'image3.jpg'; // Imagem do user2

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);

            // Act & Assert
            await expect(useCase.execute(user1ApplicationId, user2Filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });

        it('should use cache when application is cached', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const expectedImagePath = '/path/to/user1/applications/1/image1.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            await useCase.execute(applicationId, filename);
            await useCase.execute(applicationId, filename);

            // Assert
            expect(cacheService.getOrSet).toHaveBeenCalledTimes(2);
            expect(applicationRepository.findOne).not.toHaveBeenCalled();
        });
    });
});

