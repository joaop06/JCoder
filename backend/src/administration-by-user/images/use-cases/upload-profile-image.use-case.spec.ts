import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { UploadProfileImageUseCase } from './upload-profile-image.use-case';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

describe('UploadProfileImageUseCase', () => {
    let useCase: UploadProfileImageUseCase;
    let cacheService: jest.Mocked<CacheService>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let applicationRepository: jest.Mocked<Repository<Application>>;

    const mockFile: Express.Multer.File = {
        fieldname: 'profileImage',
        originalname: 'profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    };

    const mockApplication1: Partial<Application> = {
        id: 1,
        userId: 1,
        name: 'Application 1',
        profileImage: 'old-profile.jpg',
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        userId: 2,
        name: 'Application 2',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockApplicationRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        const mockCacheService = {
            applicationKey: jest.fn((id: number, type: string) => `app:${id}:${type}`),
            getOrSet: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadProfileImageUseCase,
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

        useCase = module.get<UploadProfileImageUseCase>(UploadProfileImageUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve fazer upload de imagem de perfil com sucesso quando não existe imagem anterior', async () => {
            // Arrange
            const applicationId = 2;
            const newFilename = 'new-profile.jpg';
            const updatedApplication = {
                ...mockApplication2,
                profileImage: newFilename,
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication2 as Application);
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.Application,
                applicationId,
                ImageType.Profile,
                undefined,
                'user2',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve deletar imagem anterior antes de fazer upload de nova imagem', async () => {
            // Arrange
            const applicationId = 1;
            const newFilename = 'new-profile.jpg';
            const updatedApplication = {
                ...mockApplication1,
                profileImage: newFilename,
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                'old-profile.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.Application,
                applicationId,
                ImageType.Profile,
                undefined,
                'user1',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve lançar ApplicationNotFoundException quando a aplicação não existe', async () => {
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
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários fazendo upload simultaneamente', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            applicationRepository.save
                .mockResolvedValueOnce({
                    ...mockApplication1,
                    profileImage: user1NewFilename,
                } as Application)
                .mockResolvedValueOnce({
                    ...mockApplication2,
                    profileImage: user2NewFilename,
                } as Application);

            // Act
            const result1 = await useCase.execute(user1ApplicationId, mockFile);
            const result2 = await useCase.execute(user2ApplicationId, mockFile);

            // Assert
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                1,
                mockFile,
                ResourceType.Application,
                user1ApplicationId,
                ImageType.Profile,
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                2,
                mockFile,
                ResourceType.Application,
                user2ApplicationId,
                ImageType.Profile,
                undefined,
                'user2',
            );
            expect(result1.profileImage).toBe(user1NewFilename);
            expect(result2.profileImage).toBe(user2NewFilename);
        });

        it('deve invalidar cache após fazer upload', async () => {
            // Arrange
            const applicationId = 2;
            const newFilename = 'new-profile.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication2 as Application);
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            applicationRepository.save.mockResolvedValue({
                ...mockApplication2,
                profileImage: newFilename,
            } as Application);

            // Act
            await useCase.execute(applicationId, mockFile);

            // Assert
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });

        it('deve garantir que imagens de diferentes usuários são armazenadas em diretórios separados', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            applicationRepository.save
                .mockResolvedValueOnce({
                    ...mockApplication1,
                    profileImage: user1NewFilename,
                } as Application)
                .mockResolvedValueOnce({
                    ...mockApplication2,
                    profileImage: user2NewFilename,
                } as Application);

            // Act
            await useCase.execute(user1ApplicationId, mockFile);
            await useCase.execute(user2ApplicationId, mockFile);

            // Assert - Verifica que o username foi passado corretamente para cada usuário
            const user1Call = imageStorageService.uploadImage.mock.calls[0];
            const user2Call = imageStorageService.uploadImage.mock.calls[1];

            expect(user1Call[4]).toBe('user1'); // username parameter
            expect(user2Call[4]).toBe('user2'); // username parameter
            expect(user1Call[4]).not.toBe(user2Call[4]);
        });
    });
});

