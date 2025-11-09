import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
import { DeleteTechnologyProfileImageUseCase } from './delete-technology-profile-image.use-case';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';

describe('DeleteTechnologyProfileImageUseCase', () => {
    let useCase: DeleteTechnologyProfileImageUseCase;
    let technologyRepository: jest.Mocked<Repository<Technology>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;

    const mockTechnology1: Partial<Technology> = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        profileImage: 'nodejs-profile.jpg',
    };

    const mockTechnology2: Partial<Technology> = {
        id: 2,
        userId: 2,
        name: 'React',
        profileImage: 'react-profile.jpg',
    };

    const mockTechnology3: Partial<Technology> = {
        id: 3,
        userId: 3,
        name: 'Vue.js',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockTechnologyRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteTechnologyProfileImageUseCase,
                {
                    provide: getRepositoryToken(Technology),
                    useValue: mockTechnologyRepository,
                },
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteTechnologyProfileImageUseCase>(
            DeleteTechnologyProfileImageUseCase,
        );
        technologyRepository = module.get(getRepositoryToken(Technology));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar imagem de perfil com sucesso', async () => {
            // Arrange
            const technologyId = 1;
            const updatedTechnology = {
                ...mockTechnology1,
                profileImage: null as any,
            };

            technologyRepository.findOne.mockResolvedValue(mockTechnology1 as Technology);
            imageStorageService.deleteImage.mockResolvedValue();
            technologyRepository.save.mockResolvedValue(updatedTechnology as Technology);

            // Act
            const result = await useCase.execute(technologyId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Technology,
                technologyId,
                'nodejs-profile.jpg',
            );
            expect(technologyRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImage: null,
                }),
            );
            expect(result.profileImage).toBeNull();
        });

        it('deve retornar a tecnologia sem alterações quando não tem imagem de perfil', async () => {
            // Arrange
            const technologyId = 3;

            technologyRepository.findOne.mockResolvedValue(mockTechnology3 as Technology);

            // Act
            const result = await useCase.execute(technologyId);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(technologyRepository.save).not.toHaveBeenCalled();
            expect(result).toEqual(mockTechnology3);
        });

        it('deve lançar TechnologyNotFoundException quando a tecnologia não existe', async () => {
            // Arrange
            const technologyId = 999;

            technologyRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(technologyId)).rejects.toThrow(
                TechnologyNotFoundException,
            );
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('deve garantir que múltiplas tecnologias podem deletar suas imagens', async () => {
            // Arrange
            const technology1Id = 1;
            const technology2Id = 2;

            technologyRepository.findOne
                .mockResolvedValueOnce(mockTechnology1 as Technology)
                .mockResolvedValueOnce(mockTechnology2 as Technology);

            imageStorageService.deleteImage.mockResolvedValue();
            technologyRepository.save
                .mockResolvedValueOnce({
                    ...mockTechnology1,
                    profileImage: null,
                } as Technology)
                .mockResolvedValueOnce({
                    ...mockTechnology2,
                    profileImage: null,
                } as Technology);

            // Act
            await useCase.execute(technology1Id);
            await useCase.execute(technology2Id);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                1,
                ResourceType.Technology,
                technology1Id,
                'nodejs-profile.jpg',
            );
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                2,
                ResourceType.Technology,
                technology2Id,
                'react-profile.jpg',
            );
        });
    });
});

