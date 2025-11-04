import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadUserProfileImageUseCase } from './upload-user-profile-image.use-case';
import { User } from '../../users/entities/user.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

describe('UploadUserProfileImageUseCase', () => {
    let useCase: UploadUserProfileImageUseCase;
    let userRepository: jest.Mocked<Repository<User>>;
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

    const mockUser1: Partial<User> = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        profileImage: 'old-profile.jpg',
    };

    const mockUser2: Partial<User> = {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        profileImage: null,
    };

    beforeEach(async () => {
        const mockUserRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const mockImageStorageService = {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadUserProfileImageUseCase,
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

        useCase = module.get<UploadUserProfileImageUseCase>(UploadUserProfileImageUseCase);
        userRepository = module.get(getRepositoryToken(User));
        imageStorageService = module.get(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('deve fazer upload de imagem de perfil com sucesso quando não existe imagem anterior', async () => {
            // Arrange
            const userId = 2;
            const newFilename = 'new-profile.jpg';
            const updatedUser = {
                ...mockUser2,
                profileImage: newFilename,
            };

            userRepository.findOne.mockResolvedValue(mockUser2 as User);
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            userRepository.save.mockResolvedValue(updatedUser as User);

            // Act
            const result = await useCase.execute(userId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                userId,
                ImageType.Profile,
                undefined,
                'user2',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve deletar imagem anterior antes de fazer upload de nova imagem', async () => {
            // Arrange
            const userId = 1;
            const newFilename = 'new-profile.jpg';
            const updatedUser = {
                ...mockUser1,
                profileImage: newFilename,
            };

            userRepository.findOne.mockResolvedValue(mockUser1 as User);
            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage.mockResolvedValue(newFilename);
            userRepository.save.mockResolvedValue(updatedUser as User);

            // Act
            const result = await useCase.execute(userId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).toHaveBeenCalledWith(
                ResourceType.User,
                userId,
                'old-profile.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                userId,
                ImageType.Profile,
                undefined,
                'user1',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('deve lançar UserNotFoundException quando o usuário não existe', async () => {
            // Arrange
            const userId = 999;

            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId, mockFile)).rejects.toThrow(
                UserNotFoundException,
            );
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deve garantir segmentação por usuário - múltiplos usuários fazendo upload simultaneamente', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            userRepository.save
                .mockResolvedValueOnce({
                    ...mockUser1,
                    profileImage: user1NewFilename,
                } as User)
                .mockResolvedValueOnce({
                    ...mockUser2,
                    profileImage: user2NewFilename,
                } as User);

            // Act
            const result1 = await useCase.execute(user1Id, mockFile);
            const result2 = await useCase.execute(user2Id, mockFile);

            // Assert
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                1,
                mockFile,
                ResourceType.User,
                user1Id,
                ImageType.Profile,
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImage).toHaveBeenNthCalledWith(
                2,
                mockFile,
                ResourceType.User,
                user2Id,
                ImageType.Profile,
                undefined,
                'user2',
            );
            expect(result1.profileImage).toBe(user1NewFilename);
            expect(result2.profileImage).toBe(user2NewFilename);
        });

        it('deve garantir que imagens de diferentes usuários são armazenadas em diretórios separados', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            imageStorageService.deleteImage.mockResolvedValue();
            imageStorageService.uploadImage
                .mockResolvedValueOnce(user1NewFilename)
                .mockResolvedValueOnce(user2NewFilename);

            userRepository.save
                .mockResolvedValueOnce({
                    ...mockUser1,
                    profileImage: user1NewFilename,
                } as User)
                .mockResolvedValueOnce({
                    ...mockUser2,
                    profileImage: user2NewFilename,
                } as User);

            // Act
            await useCase.execute(user1Id, mockFile);
            await useCase.execute(user2Id, mockFile);

            // Assert - Verifica que o username foi passado corretamente para cada usuário
            const user1Call = imageStorageService.uploadImage.mock.calls[0];
            const user2Call = imageStorageService.uploadImage.mock.calls[1];

            expect(user1Call[4]).toBe('user1'); // username parameter
            expect(user2Call[4]).toBe('user2'); // username parameter
            expect(user1Call[4]).not.toBe(user2Call[4]);
        });
    });
});

