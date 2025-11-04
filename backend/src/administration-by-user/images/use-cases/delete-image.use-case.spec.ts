import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteImageUseCase } from './delete-image.use-case';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

describe('DeleteImageUseCase', () => {
    let useCase: DeleteImageUseCase;
    let applicationRepository: jest.Mocked<Repository<Application>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let cacheService: jest.Mocked<CacheService>;

    const mockApplication1: Partial<Application> = {
        id: 1,
        username: 'user1',
        name: 'Application 1',
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    };

    const mockApplication2: Partial<Application> = {
        id: 2,
        username: 'user2',
        name: 'Application 2',
        images: ['image4.jpg', 'image5.jpg'],
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
            ],
        }).compile();

        useCase = module.get<DeleteImageUseCase>(DeleteImageUseCase);
        applicationRepository = module.get(getRepositoryToken(Application));
        imageStorageService = module.get(ImageStorageService);
        cacheService = module.get(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar imagem com sucesso', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';
            const updatedApplication = {
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            };

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue(updatedApplication as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Application,
                applicationId,
                filename,
                undefined,
                'user1',
            );
            expect(applicationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: ['image1.jpg', 'image3.jpg'],
                }),
            );
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });

        it('deve lançar ApplicationNotFoundException quando a imagem não existe no array', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(
                ApplicationNotFoundException,
            );
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('deve lançar ApplicationNotFoundException quando a aplicação não tem imagens', async () => {
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

        it('deve lançar ApplicationNotFoundException quando a aplicação não existe', async () => {
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

        it('deve garantir segmentação por usuário - múltiplos usuários deletando imagens simultaneamente', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user2ApplicationId = 2;
            const user1Filename = 'image2.jpg';
            const user2Filename = 'image4.jpg';

            cacheService.getOrSet
                .mockResolvedValueOnce(mockApplication1 as Application)
                .mockResolvedValueOnce(mockApplication2 as Application);

            imageStorageService.deleteImage.mockResolvedValue();
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

        it('deve garantir que apenas a imagem do usuário correto é deletada', async () => {
            // Arrange
            const user1ApplicationId = 1;
            const user1Filename = 'image2.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(user1ApplicationId, user1Filename);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Application,
                user1ApplicationId,
                user1Filename,
                undefined,
                'user1',
            );
            // Verifica que não foi chamado com os dados do user2
            expect(imageStorageService.deleteImage).not.toHaveBeenCalledWith(
                ResourceType.Application,
                2,
                expect.any(String),
                undefined,
                'user2',
            );
        });

        it('deve remover apenas a imagem especificada do array', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(applicationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: expect.arrayContaining(['image1.jpg', 'image3.jpg']),
                }),
            );
            const savedApplication = (applicationRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedApplication.images).not.toContain('image2.jpg');
            expect(savedApplication.images).toHaveLength(2);
        });

        it('deve invalidar cache após deletar imagem', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image2.jpg';

            cacheService.getOrSet.mockResolvedValue(mockApplication1 as Application);
            imageStorageService.deleteImage.mockResolvedValue();
            applicationRepository.save.mockResolvedValue({
                ...mockApplication1,
                images: ['image1.jpg', 'image3.jpg'],
            } as Application);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(cacheService.del).toHaveBeenCalledWith(`app:${applicationId}:full`);
        });
    });
});

