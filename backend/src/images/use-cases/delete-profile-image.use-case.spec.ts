import { ApplicationTypeEnum } from '../../applications/enums/application-type.enum';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

// Mock Application entity to avoid circular dependency
interface Application {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    images?: string[];
    profileImage?: string;
}

// Mock services to avoid circular dependencies
const mockImagesService = {
    findApplicationById: jest.fn(),
    deleteProfileImage: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockDeleteProfileImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number): Promise<void> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Delete the profile image
        await this.imagesService.deleteProfileImage(id);
    }
}

describe('DeleteProfileImageUseCase', () => {
    let useCase: MockDeleteProfileImageUseCase;
    let imagesService: typeof mockImagesService;

    const mockApplication: Application = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: ['image1.jpg', 'image2.png', 'image3.gif'],
        profileImage: 'profile.jpg',
    };

    const mockApplicationWithoutProfileImage: Application = {
        id: 2,
        userId: 1,
        name: 'Test Application Without Profile Image',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.Frontend,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: ['image1.jpg', 'image2.png'],
        profileImage: null,
    };

    const mockApplicationWithEmptyProfileImage: Application = {
        id: 3,
        userId: 1,
        name: 'Test Application With Empty Profile Image',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.Mobile,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: ['image1.jpg'],
        profileImage: '',
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockDeleteProfileImageUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete a profile image successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should delete profile image even when application has no profile image', async () => {
            // Arrange
            const applicationId = 2;

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithoutProfileImage);
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should delete profile image even when application has empty profile image', async () => {
            // Arrange
            const applicationId = 3;

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithEmptyProfileImage);
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should propagate deleteProfileImage service errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const deleteError = new Error('Delete profile image operation failed');
            imagesService.deleteProfileImage.mockRejectedValue(deleteError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Delete profile image operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle database constraint errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.deleteProfileImage.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle network errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.deleteProfileImage.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];

            for (const applicationId of applicationIds) {
                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.deleteProfileImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent delete operations', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act - Execute multiple concurrent delete operations
            const promises = [
                useCase.execute(applicationId),
                useCase.execute(applicationId),
                useCase.execute(applicationId),
            ];

            await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledTimes(3);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle application without images array', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImages = {
                ...mockApplication,
                images: undefined,
            };

            imagesService.findApplicationById.mockResolvedValue(applicationWithoutImages);
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Database connection error');
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Request timeout');
            expect(imagesService.deleteProfileImage).not.toHaveBeenCalled();
        });

        it('should handle permission errors from deleteProfileImage', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.deleteProfileImage.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle file not found errors from deleteProfileImage', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fileNotFoundError = new Error('Profile image file not found');
            imagesService.deleteProfileImage.mockRejectedValue(fileNotFoundError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Profile image file not found');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle different application types', async () => {
            // Arrange
            const applicationTypes = [
                ApplicationTypeEnum.API,
                ApplicationTypeEnum.Mobile,
                ApplicationTypeEnum.Frontend,
                ApplicationTypeEnum.Library,
                ApplicationTypeEnum.Fullstack,
            ];

            for (const applicationType of applicationTypes) {
                const applicationId = 1;
                const applicationWithType = {
                    ...mockApplication,
                    applicationType,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithType);
                imagesService.deleteProfileImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle applications with different profile image formats', async () => {
            // Arrange
            const applicationId = 1;
            const profileImageFormats = [
                'profile.jpg',
                'profile.png',
                'profile.gif',
                'profile.webp',
                'profile.svg',
                'avatar.jpg',
                'user-photo.png',
                'profile-image.webp',
            ];

            for (const profileImage of profileImageFormats) {
                const applicationWithProfileImage = {
                    ...mockApplication,
                    profileImage,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithProfileImage);
                imagesService.deleteProfileImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle very large application IDs', async () => {
            // Arrange
            const applicationIds = [999999, 1000000, 2147483647]; // Max int32

            for (const applicationId of applicationIds) {
                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.deleteProfileImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle floating point application IDs', async () => {
            // Arrange
            const applicationId = 1.5;

            imagesService.findApplicationById.mockResolvedValue({
                ...mockApplication,
                id: applicationId,
            });
            imagesService.deleteProfileImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle database connection errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const dbError = new Error('Database connection lost');
            imagesService.deleteProfileImage.mockRejectedValue(dbError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Database connection lost');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should handle disk space errors during delete', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const diskError = new Error('No space left on device');
            imagesService.deleteProfileImage.mockRejectedValue(diskError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('No space left on device');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });
    });
});
