import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { GetUserProfileImageUseCase } from './get-user-profile-image.use-case';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

describe('GetUserProfileImageUseCase', () => {
    let useCase: GetUserProfileImageUseCase;
    let userRepository: jest.Mocked<Repository<User>>;
    let imageStorageService: jest.Mocked<ImageStorageService>;

    const mockUser1: Partial<User> = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        profileImage: 'profile-image-1.jpg',
    };

    const mockUser2: Partial<User> = {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        profileImage: 'profile-image-2.jpg',
    };

    beforeEach(async () => {
        const mockUserRepository = {
            findOne: jest.fn(),
        };

        const mockImageStorageService = {
            getImagePath: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserProfileImageUseCase,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: ImageStorageService,
                    useValue: mockImageStorageService,
                },
            ],
        }).compile();

        useCase = module.get<GetUserProfileImageUseCase>(GetUserProfileImageUseCase);
        userRepository = module.get(getRepositoryToken(User));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve retornar o caminho da imagem de perfil com sucesso', async () => {
            // Arrange
            const userId = 1;
            const expectedImagePath = '/path/to/user1/users/1/profile-image-1.jpg';

            userRepository.findOne.mockResolvedValue(mockUser1 as User);
            imageStorageService.getImagePath.mockResolvedValue(expectedImagePath);

            // Act
            const result = await useCase.execute(userId);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.User,
                userId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(result).toBe(expectedImagePath);
        });

        it('deve lançar erro quando o usuário não tem imagem de perfil', async () => {
            // Arrange
            const userId = 1;
            const userWithoutImage = {
                ...mockUser1,
                profileImage: null as any,
            };

            userRepository.findOne.mockResolvedValue(userWithoutImage as User);

            // Act & Assert
            await expect(useCase.execute(userId)).rejects.toThrow(
                'User has no profile image',
            );
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('deve lançar UserNotFoundException quando o usuário não existe', async () => {
            // Arrange
            const userId = 999;

            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId)).rejects.toThrow(UserNotFoundException);
            expect(imageStorageService.getImagePath).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários buscando imagens', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;
            const user1ImagePath = '/path/to/user1/users/1/profile-image-1.jpg';
            const user2ImagePath = '/path/to/user2/users/2/profile-image-2.jpg';

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            imageStorageService.getImagePath
                .mockResolvedValueOnce(user1ImagePath)
                .mockResolvedValueOnce(user2ImagePath);

            // Act
            const result1 = await useCase.execute(user1Id);
            const result2 = await useCase.execute(user2Id);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                1,
                ResourceType.User,
                user1Id,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.getImagePath).toHaveBeenNthCalledWith(
                2,
                ResourceType.User,
                user2Id,
                'profile-image-2.jpg',
                undefined,
                'user2',
            );
            expect(result1).toBe(user1ImagePath);
            expect(result2).toBe(user2ImagePath);
            expect(result1).not.toBe(result2);
        });

        it('deve garantir que usuário não pode acessar imagem de outro usuário', async () => {
            // Arrange
            const user1Id = 1;

            userRepository.findOne.mockResolvedValue(mockUser1 as User);
            imageStorageService.getImagePath.mockResolvedValue(
                '/path/to/user1/users/1/profile-image-1.jpg',
            );

            // Act
            const result = await useCase.execute(user1Id);

            // Assert
            expect(imageStorageService.getImagePath).toHaveBeenCalledWith(
                ResourceType.User,
                user1Id,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            // Verifica que não foi chamado com os dados do user2
            expect(imageStorageService.getImagePath).not.toHaveBeenCalledWith(
                ResourceType.User,
                2,
                expect.any(String),
                undefined,
                'user2',
            );
            expect(result).toContain('user1');
            expect(result).not.toContain('user2');
        });
    });
});

