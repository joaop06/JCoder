import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceType } from '../enums/resource-type.enum';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('../../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock do uuid antes de importar ImageStorageService
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
}));

// Mock dos serviços antes de importar
jest.mock('../services/image-storage.service', () => ({
    ImageStorageService: jest.fn().mockImplementation(() => ({
        uploadImage: jest.fn(),
        deleteImage: jest.fn(),
    })),
}));

import { User } from '../../users/entities/user.entity';
import { ImageStorageService } from '../services/image-storage.service';
import { UploadUserProfileImageUseCase } from './upload-user-profile-image.use-case';

describe('UploadUserProfileImageUseCase', () => {
    let useCase: UploadUserProfileImageUseCase;
    let userRepository: Repository<User>;
    let imageStorageService: ImageStorageService;

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
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        imageStorageService = module.get<ImageStorageService>(ImageStorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should upload profile image successfully when no previous image exists', async () => {
            // Arrange
            const userId = 2;
            const newFilename = 'new-profile.jpg';
            const updatedUser = {
                ...mockUser2,
                profileImage: newFilename,
            };

            (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser2 as User);
            (imageStorageService.uploadImage as jest.Mock).mockResolvedValue(newFilename);
            (userRepository.save as jest.Mock).mockResolvedValue(updatedUser as User);

            // Act
            const result = await useCase.execute(userId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage).not.toHaveBeenCalled();
            expect(imageStorageService.uploadImage as jest.Mock).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                userId,
                ImageType.Profile,
                undefined,
                'user2',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('should delete previous image before uploading new image', async () => {
            // Arrange
            const userId = 1;
            const newFilename = 'new-profile.jpg';
            const updatedUser = {
                ...mockUser1,
                profileImage: newFilename,
            };

            (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser1 as User);
            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
            (imageStorageService.uploadImage as jest.Mock).mockResolvedValue(newFilename);
            (userRepository.save as jest.Mock).mockResolvedValue(updatedUser as User);

            // Act
            const result = await useCase.execute(userId, mockFile);

            // Assert
            expect(imageStorageService.deleteImage as jest.Mock).toHaveBeenCalledWith(
                ResourceType.User,
                userId,
                'old-profile.jpg',
                undefined,
                'user1',
            );
            expect(imageStorageService.uploadImage as jest.Mock).toHaveBeenCalledWith(
                mockFile,
                ResourceType.User,
                userId,
                ImageType.Profile,
                undefined,
                'user1',
            );
            expect(result.profileImage).toBe(newFilename);
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            // Arrange
            const userId = 999;

            (userRepository.findOne as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId, mockFile)).rejects.toThrow(
                UserNotFoundException,
            );
            expect(imageStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('should ensure user segmentation - multiple users uploading simultaneously', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
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

        it('should ensure that images from different users are stored in separate directories', async () => {
            // Arrange
            const user1Id = 1;
            const user2Id = 2;
            const user1NewFilename = 'user1-profile.jpg';
            const user2NewFilename = 'user2-profile.jpg';

            userRepository.findOne
                .mockResolvedValueOnce(mockUser1 as User)
                .mockResolvedValueOnce(mockUser2 as User);

            (imageStorageService.deleteImage as jest.Mock).mockResolvedValue();
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

            // Assert - Verify that the username was passed correctly for each user
            const user1Call = imageStorageService.uploadImage.mock.calls[0];
            const user2Call = imageStorageService.uploadImage.mock.calls[1];

            expect(user1Call[4]).toBe('user1'); // username parameter
            expect(user2Call[4]).toBe('user2'); // username parameter
            expect(user1Call[4]).not.toBe(user2Call[4]);
        });
    });
});

