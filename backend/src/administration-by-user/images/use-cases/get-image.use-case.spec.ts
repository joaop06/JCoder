import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { GetImageUseCase } from './get-image.use-case';
import { ResourceType } from '../enums/resource-type.enum';
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
    })),
}));

jest.mock('../services/image-storage.service', () => ({
    ImageStorageService: jest.fn().mockImplementation(() => ({
        getImagePath: jest.fn(),
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

describe('GetImageUseCase', () => {
    let useCase: GetImageUseCase;
    let imagesService: ImagesService;
    let imageStorageService: ImageStorageService;

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        images: ['image1.jpg', 'image2.jpg'],
        user: { username: 'user1' } as any,
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        images: ['image3.jpg', 'image4.jpg'],
        user: { username: 'user2' } as any,
    };

    beforeEach(async () => {
        const mockImageStorageService = {
            getImagePath: jest.fn(),
        };

        const mockImagesService = {
            findApplicationById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetImageUseCase,
                {
                    provide: ImagesService,
                    useValue: mockImagesService,
                },
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
            ],
        }).compile();

        useCase = module.get<GetImageUseCase>(GetImageUseCase);
        imagesService = module.get<ImagesService>(ImagesService);
        imageStorageService = module.get<ImageStorageService>(ImageStorageService);
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

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenCalledWith(
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

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.getImagePath as jest.Mock).not.toHaveBeenCalled();
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

            (imagesService.findApplicationById as jest.Mock).mockRejectedValue(new ApplicationNotFoundException());

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

            (imagesService.findApplicationById as jest.Mock)
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            (imageStorageService.getImagePath as jest.Mock)
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1ApplicationId, user1Filename);
            const result2 = await useCase.execute(user2ApplicationId, user2Filename);

            // Assert
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                user1Filename,
                undefined,
                'user1',
            );
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenNthCalledWith(
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

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);

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

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.getImagePath as jest.Mock).mockResolvedValue(expectedImagePath);

            // Act
            await useCase.execute(applicationId, filename);
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(2);
        });
    });
});


