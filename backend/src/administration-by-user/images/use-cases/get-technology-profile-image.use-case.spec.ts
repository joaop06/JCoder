import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
import { GetTechnologyProfileImageUseCase } from './get-technology-profile-image.use-case';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';

describe('GetTechnologyProfileImageUseCase', () => {
    let useCase: GetTechnologyProfileImageUseCase;
    let imageStorageService: jest.Mocked<ImageStorageService>;
    let technologyRepository: jest.Mocked<Repository<Technology>>;

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

    beforeEach(async () => {
        const mockTechnologyRepository = {
            findOne: jest.fn(),
        };

        const mockImageStorageService = {
            getImagePath: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetTechnologyProfileImageUseCase,
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

        useCase = module.get<GetTechnologyProfileImageUseCase>(
            GetTechnologyProfileImageUseCase,
        );
        technologyRepository = module.get(getRepositoryToken(Technology));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should return profile image path successfully', async () => {
            // Arrange
            const technologyId = 1;
            const expectedImagePath = '/path/to/technologies/1/nodejs-profile.jpg';

            technologyRepository.findOne.mockResolvedValue(mockTechnology1 as Technology);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(technologyId);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.Technology,
                technologyId,
                'nodejs-profile.jpg',
            );
            expect(result).toBe(expectedImagePath);
        });

        it('should throw error when technology has no profile image', async () => {
            // Arrange
            const technologyId = 1;
            const technologyWithoutImage = {
                ...mockTechnology1,
                profileImage: null as any,
            };

            technologyRepository.findOne.mockResolvedValue(
                technologyWithoutImage as Technology,
            );

            // Act & Assert
            await expect(useCase.execute(technologyId)).rejects.toThrow(
                'Technology has no profile image',
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('should throw TechnologyNotFoundException when technology does not exist', async () => {
            // Arrange
            const technologyId = 999;

            technologyRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(technologyId)).rejects.toThrow(
                TechnologyNotFoundException,
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('should ensure that multiple technologies can fetch their images', async () => {
            // Arrange
            const technology1Id = 1;
            const technology2Id = 2;
            const technology1ImagePath = '/path/to/technologies/1/nodejs-profile.jpg';
            const technology2ImagePath = '/path/to/technologies/2/react-profile.jpg';

            technologyRepository.findOne
                .mockResolvedValueOnce(mockTechnology1 as Technology)
                .mockResolvedValueOnce(mockTechnology2 as Technology);

            imageStorageService.getImagePath
                .mockResolvedValueOnce(technology1ImagePath)
                .mockResolvedValueOnce(technology2ImagePath);

            // Act
            const result1 = await useCase.execute(technology1Id);
            const result2 = await useCase.execute(technology2Id);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                1,
                ResourceType.Technology,
                technology1Id,
                'nodejs-profile.jpg',
            );
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                2,
                ResourceType.Technology,
                technology2Id,
                'react-profile.jpg',
            );
            expect(result1).toBe(technology1ImagePath);
            expect(result2).toBe(technology2ImagePath);
            expect(result1).not.toBe(result2);
        });
    });
});

