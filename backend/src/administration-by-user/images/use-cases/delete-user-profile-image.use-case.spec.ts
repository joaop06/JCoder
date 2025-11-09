import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { DeleteUserProfileImageUseCase } from './delete-user-profile-image.use-case';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

describe('DeleteUserProfileImageUseCase', () => {
    let useCase: DeleteUserProfileImageUseCase;
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

    const mockUser3: Partial<User> = {
        id: 3,
        username: 'user3',
        email: 'user3@example.com',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockUserRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteUserProfileImageUseCase,
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

        useCase = module.get<DeleteUserProfileImageUseCase>(DeleteUserProfileImageUseCase);
        userRepository = module.get(getRepositoryToken(User));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve deletar imagem de perfil com sucesso', async () => {
            // Arrange
            const userId = 1;
            const updatedUser = {
                ...mockUser1,
                profileImage: null as any,
            };

            userRepository.findOne.mockResolvedValue(mockUser1 as User);
            imageStorageService.deleteImage.mockResolvedValue();
            userRepository.save.mockResolvedValue(updatedUser as User);

            // Act
            const result = await useCase.execute(userId);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                userId,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImage: null,
                }),
            );
            expect(result.profileImage).toBeNull();
        });

        it('deve retornar o usuário sem alterações quando não tem imagem de perfil', async () => {
            // Arrange
            const userId = 3;

            userRepository.findOne.mockResolvedValue(mockUser3 as User);

            // Act
            const result = await useCase.execute(userId);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
            expect(result).toEqual(mockUser3);
        });

        it('deve lançar UserNotFoundException quando o usuário não existe', async () => {
            // Arrange
            const userId = 999;

            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId)).rejects.toThrow(UserNotFoundException);
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários deletando imagens simultaneamente', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            imageStorageService.deleteImage.mockResolvedValue();
            userRepository.save
                .mockResolvedValueOnce({
                    ...mockUser1,
                    profileImage: null,
                } as User)
                .mockResolvedValueOnce({
                    ...mockUser2,
                    profileImage: null,
                } as User);

            // Act
            await useCase.execute(user1Id);
            await useCase.execute(user2Id);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                1,
                ResourceType.User,
                user1Id,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.deleteImage).toHaveBeenNthCalledWith(
                2,
                ResourceType.User,
                user2Id,
                'profile-image-2.jpg',
                undefined,
                'user2',
            );
        });

        it('deve garantir que apenas a imagem do usuário correto é deletada', async () => {
            // Arrange
            const user1Id = 1;

            userRepository.findOne.mockResolvedValue(mockUser1 as User);
            imageStorageService.deleteImage.mockResolvedValue();
            userRepository.save.mockResolvedValue({
                ...mockUser1,
                profileImage: null,
            } as User);

            // Act
            await useCase.execute(user1Id);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                user1Id,
                'profile-image-1.jpg',
                undefined,
                'user1',
            );
            // Verifica que não foi chamado com os dados do user2
            expect(imageStorageService.deleteImage).not.toHaveBeenCalledWith(
                ResourceType.User,
                2,
                expect.any(String),
                undefined,
                'user2',
            );
        });
    });
});

