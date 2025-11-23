import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { DeleteProfileImageUseCase } from './delete-profile-image.use-case';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

describe('DeleteProfileImageUseCase', () => {
    let useCase: DeleteProfileImageUseCase;
    let cacheService: jest.Mocked<CacheService>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let applicationRepository: jest.Mocked<Repository<Application>>;

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        profileImage: 'profile-image-1.jpg',
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        profileImage: 'profile-image-2.jpg',
    };

    beforeEach(async () => {
        const mockApplicationRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            deleteImage: jest.fn(),
        };

        const mockCacheService = {
            applicationKey: jest.fn((id: number, type: string) => `app:${id}:${type}`),
            getOrSet: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteProfileImageUseCase,
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

        useCase = module.get<DeleteProfileImageUseCase>(DeleteProfileImageUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete profile image successfully', async () => {
            // Arrange
            const applicationId = 1;
            const updatedApplication = {
                ...mockApplication1,
                profileImage: null as any,
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(applicationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImage: null,
                }),
            );
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });

        it('should throw ApplicationNotFoundException when application has no profile image', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImage = {
                ...mockApplication1,
                profileImage: null as any,
            };

            cacheService.getOrSet.mockResolvedValue(applicationWithoutImage as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;

            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                if (typeof fn === 'function') {
                    const result = await fn();
                    return result;
                }
                return null;
            });

            applicationRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(
                ApplicationNotFoundException,
            );
        });

        it('should ensure user segmentation - multiple users deleting images simultaneously', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save
                .mockResolvedValueOnce({
                    ...mockApplication1,
                    profileImage: null,
                } as Application)
                .mockResolvedValueOnce({
                    ...mockApplication2,
                    profileImage: null,
                } as Application);

            // Act
            await useCase.execute(user1ApplicationId);
            await useCase.execute(user2ApplicationId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                2,
                ResourceType.Application,
                user2ApplicationId,
                'profile-image-2.jpg',
                undefined,
                'user2',
            );
        });

        it('should ensure that only the correct user\'s image is deleted', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                profileImage: null,
            } as Application);

            // Act
            await useCase.execute(user1ApplicationId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Application,
                user1ApplicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            // Verify that it was not called with user2's data
            expect(imageStorageService.deleteImage).not.toHaveBeenCalledWith(
                ResourceType.Application,
                user2ApplicationId,
                'profile-image-2.jpg',
                undefined,
                'user2',
            );
        });

        it('should invalidate cache after deleting image', async () => {
            // Arrange
            const applicationId = 1;

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                profileImage: null,
            } as Application);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });
    });
});

