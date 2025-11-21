import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { GetProfileImageUseCase } from './get-profile-image.use-case';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

describe('GetProfileImageUseCase', () => {
    let useCase: GetProfileImageUseCase;
    let applicationRepository: jest.Mocked<Repository<Application>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let cacheService: jest.Mocked<CacheService>;

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
                GetProfileImageUseCase,
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

        useCase = module.get<GetProfileImageUseCase>(GetProfileImageUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return profile image path successfully', async () => {
            // Arrange
            const applicationId = 1;
            const expectedImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(cacheService.getOrSet).toHaveBeenCalledWith(
                `app:${applicationId}:full`,
                expect.any(Function),
                600,
            );
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
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

            cacheService.getOrSet.mockResolvedValue(applicationWithoutImage as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
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

        it('should ensure user segmentation - multiple users with different applications', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1ImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';
            const user2ImagePath = '/path/to/user2/applications/2/profile-image-2.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.getImagePath
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1ApplicationId);
            const result2 = await useCase.execute(user2ApplicationId);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                1,
                ResourceType.Application,
                user1ApplicationId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
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

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            await useCase.execute(applicationId);
            await useCase.execute(applicationId);

            // Assert
            expect(cacheService.getOrSet).toHaveBeenCalledTimes(2);
            expect(applicationRepository.findOne).not.toHaveBeenCalled();
        });

        it('should fetch from database when not cached', async () => {
            // Arrange
            const applicationId = 1;
            const expectedImagePath = '/path/to/user1/applications/1/profile-image-1.jpg';

            cacheService.getOrSet.mockImplementation(async (key, fn) => {
                if (typeof fn === 'function') {
                    return await fn();
                }
                return null;
            });

            applicationRepository.findOne.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(applicationRepository.findOne).toHaveBeenCalledWith({
                where: { id: applicationId },
                relations: {
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
            expect(result).toBe(expectedImagePath);
        });
    });
});

