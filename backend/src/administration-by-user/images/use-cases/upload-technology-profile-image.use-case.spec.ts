import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
import { UploadTechnologyProfileImageUseCase } from './upload-technology-profile-image.use-case';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';

describe('UploadTechnologyProfileImageUseCase', () => {
    let useCase: UploadTechnologyProfileImageUseCase;
    let technologyRepository: jest.Mocked<Repository<Technology>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;

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

    const mockTechnology1: Partial<Technology> = {
        id: 1,
        userId: 1,
        name: 'Node.js',
        profileImage: 'old-profile.jpg',
    };

    const mockTechnology2: Partial<Technology> = {
        id: 2,
        userId: 2,
        name: 'React',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockTechnologyRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadTechnologyProfileImageUseCase,
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

        useCase = module.get<UploadTechnologyProfileImageUseCase>(
            UploadTechnologyProfileImageUseCase,
        );
        technologyRepository = module.get(getRepositoryToken(Technology));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve fazer upload de imagem de perfil com sucesso quando não existe imagem anterior', async () => {
            // Arrange
            const technologyId = 2;
            const newFilename = 'new-profile.jpg';
            const updatedTechnology = {
                ...mockTechnology2,
                profileImage: newFilename,
            };

            technologyRepository.findOne.mockResolvedValue(mockTechnology2 as Technology);
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            technologyRepository.save.mockResolvedValue(updatedTechnology as Technology);

            // Act
            const result = await useCase.execute(technologyId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.Technology,
                technologyId,
                ImageType.Profile,
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve deletar imagem anterior antes de fazer upload de nova imagem', async () => {
            // Arrange
            const technologyId = 1;
            const newFilename = 'new-profile.jpg';
            const updatedTechnology = {
                ...mockTechnology1,
                profileImage: newFilename,
            };

            technologyRepository.findOne.mockResolvedValue(mockTechnology1 as Technology);
            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            technologyRepository.save.mockResolvedValue(updatedTechnology as Technology);

            // Act
            const result = await useCase.execute(technologyId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.Technology,
                technologyId,
                'old-profile.jpg',
            );
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.Technology,
                technologyId,
                ImageType.Profile,
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve lançar TechnologyNotFoundException quando a tecnologia não existe', async () => {
            // Arrange
            const technologyId = 999;

            technologyRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(technologyId, mockFile)).rejects.toThrow(
                TechnologyNotFoundException,
            );
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deve garantir que múltiplas tecnologias podem ter imagens de perfil', async () => {
            // Arrange
            const technology1Id = 1;
            const technology2Id = 2;
            const technology1NewFilename = 'nodejs-profile.jpg';
            const technology2NewFilename = 'react-profile.jpg';

            technologyRepository.findOne
                .mockResolvedValueOnce(mockTechnology1 as Technology)
                .mockResolvedValueOnce(mockTechnology2 as Technology);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(technology1NewFilename)
                .mockResolvedValueOnce(technology2NewFilename);

            technologyRepository.save
                .mockResolvedValueOnce({
                    ...mockTechnology1,
                    profileImage: technology1NewFilename,
                } as Technology)
                .mockResolvedValueOnce({
                    ...mockTechnology2,
                    profileImage: technology2NewFilename,
                } as Technology);

            // Act
            const result1 = await useCase.execute(technology1Id, mockFile);
            const result2 = await useCase.execute(technology2Id, mockFile);

            // Assert
            expect(result1.profileImage).toBe(technology1NewFilename);
            expect(result2.profileImage).toBe(technology2NewFilename);
            expect(result1.profileImage).not.toBe(result2.profileImage);
        });
    });
});

