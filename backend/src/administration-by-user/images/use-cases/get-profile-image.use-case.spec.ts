import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { GetProfileImageUseCase } from './get-profile-image.use-case';
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

import { ImageStorageService } from '../services/image-storage.service';
import { ImagesService } from '../images.service';
import { Application } from '../../applications/entities/application.entity';

describe('GetProfileImageUseCase', () => {
    let useCase: GetProfileImageUseCase;
    let imagesService: ImagesService;
    let imageStorageService: ImageStorageService;

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        profileImage: 'profile-image-1.jpg',
        user: { username: 'user1' } as any,
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        profileImage: 'profile-image-2.jpg',
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
                GetProfileImageUseCase,
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
                {
                    provide: ImagesService,
                    useValue: mockImagesService,
                },
            ],
        }).compile();

        useCase = module.get<GetProfileImageUseCase>(GetProfileImageUseCase);
        imagesService = module.get<ImagesService>(ImagesService);
        imageStorageService = module.get<ImageStorageService>(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return profile image path successfully', async () => {
            // Arrange
            const applicationId = 1;
            const expectedImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.getImagePath as jest.Mock).mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(result).toBe(expectedImagePath);
        });

        it('should throw ApplicationNotFoundException when application has no profile image', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImage = {
                ...mockApplication1,
                profileImage: null as any,
            };

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(applicationWithoutImage as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.getImagePath as jest.Mock).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;

            (imagesService.findApplicationById as jest.Mock).mockRejectedValue(new ApplicationNotFoundException());

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });

        it('should ensure user segmentation - multiple users with different applications', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1ImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';
            const user2ImagePath = '/path/to/user2/applications/2/profile-image-2.jpg';

            (imagesService.findApplicationById as jest.Mock)
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            (imageStorageService.getImagePath as jest.Mock)
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1ApplicationId);
            const result2 = await useCase.execute(user2ApplicationId);

            // Assert
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.getImagePath as jest.Mock).toHaveBeenNthCalledWith(
                2,
                ResourceType.Application,
                user2ApplicationId,
                'profile-image-2.jpg',
                undefined,
                'user2',
            );
            expect(result1).toBe(user1ImagePath);
            expect(result2).toBe(user2ImagePath);
            expect(result1).not.toBe(result2);
        });

        it('should use cache when application is cached', async () => {
            // Arrange
            const applicationId = 1;
            const expectedImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.getImagePath as jest.Mock).mockResolvedValue(expectedImagePath);

            // Act
            await useCase.execute(applicationId);
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(2);
        });

        it('should fetch from database when not cached', async () => {
            // Arrange
            const applicationId = 1;
            const expectedImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';

            (imagesService.findApplicationById as jest.Mock).mockResolvedValue(mockApplication1 as Application);
            (imageStorageService.getImagePath as jest.Mock).mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(result).toBe(expectedImagePath);
        });
    });
});

