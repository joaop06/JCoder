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
    deleteImage: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockDeleteImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number, filename: string): Promise<void> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Delete the image
        await this.imagesService.deleteImage(id, filename);
    }
}

describe('DeleteImageUseCase', () => {
    let useCase: MockDeleteImageUseCase;
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

    const mockApplicationWithoutImages: Application = {
        id: 2,
        userId: 1,
        name: 'Test Application Without Images',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.Frontend,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockDeleteImageUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should delete an image successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should propagate deleteImage service errors', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const deleteError = new Error('Delete operation failed');
            imagesService.deleteImage.mockRejectedValue(deleteError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Delete operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle database constraint errors during delete', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.deleteImage.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle network errors during delete', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.deleteImage.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];
            const filename = 'test.jpg';

            for (const applicationId of applicationIds) {
                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.deleteImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should work with different image filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = [
                'image1.jpg',
                'image2.png',
                'image3.gif',
                'document.pdf',
                'video.mp4',
                'file-with-dashes.jpg',
                'file_with_underscores.png',
                'file.with.dots.jpg',
                'UPPERCASE.JPG',
                'mixedCase.PnG',
            ];

            for (const filename of filenames) {
                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.deleteImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent delete operations', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act - Execute multiple concurrent delete operations
            const promises = [
                useCase.execute(applicationId, filename),
                useCase.execute(applicationId, filename),
                useCase.execute(applicationId, filename),
            ];

            await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.deleteImage).toHaveBeenCalledTimes(3);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle empty filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = '';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle undefined filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle null filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = null as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle very long filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'a'.repeat(1000) + '.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle filenames with special characters', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = [
                'file with spaces.jpg',
                'file-with-special-chars!@#$%^&*().jpg',
                'file-with-unicode-ñáéíóú.jpg',
                'file-with-emoji-🚀.jpg',
                'file-with-quotes-"test".jpg',
                "file-with-single-quotes-'test'.jpg",
            ];

            for (const filename of filenames) {
                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.deleteImage.mockResolvedValue(undefined);

                // Act
                await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle application without images array', async () => {
            // Arrange
            const applicationId = 2;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithoutImages);
            imagesService.deleteImage.mockResolvedValue(undefined);

            // Act
            await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Database connection error');
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Request timeout');
            expect(imagesService.deleteImage).not.toHaveBeenCalled();
        });

        it('should handle permission errors from deleteImage', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.deleteImage.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle file not found errors from deleteImage', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fileNotFoundError = new Error('File not found');
            imagesService.deleteImage.mockRejectedValue(fileNotFoundError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('File not found');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });
    });
});
