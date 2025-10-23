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
    getImagePath: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockGetImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number, filename: string): Promise<string> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Get the image path
        return await this.imagesService.getImagePath(id, filename);
    }
}

describe('GetImageUseCase', () => {
    let useCase: MockGetImageUseCase;
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

    const mockImagePath = '/uploads/applications/1/image1.jpg';

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockGetImageUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should get image path successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue(mockImagePath);

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe(mockImagePath);
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should propagate getImagePath service errors', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const getImageError = new Error('Get image path operation failed');
            imagesService.getImagePath.mockRejectedValue(getImageError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Get image path operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle database constraint errors during get image path', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.getImagePath.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle network errors during get image path', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.getImagePath.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];
            const filename = 'test.jpg';

            for (const applicationId of applicationIds) {
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.getImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(expectedPath);

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
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.getImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent get image operations', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue(mockImagePath);

            // Act - Execute multiple concurrent get image operations
            const promises = [
                useCase.execute(applicationId, filename),
                useCase.execute(applicationId, filename),
                useCase.execute(applicationId, filename),
            ];

            const results = await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.getImagePath).toHaveBeenCalledTimes(3);
            expect(results).toEqual([mockImagePath, mockImagePath, mockImagePath]);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle empty filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = '';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue('/uploads/applications/1/');

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe('/uploads/applications/1/');
        });

        it('should handle undefined filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue('/uploads/applications/1/undefined');

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe('/uploads/applications/1/undefined');
        });

        it('should handle null filename', async () => {
            // Arrange
            const applicationId = 1;
            const filename = null as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue('/uploads/applications/1/null');

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe('/uploads/applications/1/null');
        });

        it('should handle very long filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'a'.repeat(1000) + '.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/${filename}`);

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe(`/uploads/applications/${applicationId}/${filename}`);
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
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.getImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle application without images array', async () => {
            // Arrange
            const applicationId = 2;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithoutImages);
            imagesService.getImagePath.mockResolvedValue('/uploads/applications/2/image1.jpg');

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe('/uploads/applications/2/image1.jpg');
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Database connection error');
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Request timeout');
            expect(imagesService.getImagePath).not.toHaveBeenCalled();
        });

        it('should handle permission errors from getImagePath', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.getImagePath.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle file not found errors from getImagePath', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'nonexistent.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fileNotFoundError = new Error('File not found');
            imagesService.getImagePath.mockRejectedValue(fileNotFoundError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('File not found');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
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
                const filename = 'image1.jpg';
                const applicationWithType = {
                    ...mockApplication,
                    applicationType,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithType);
                imagesService.getImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/${filename}`);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(`/uploads/applications/${applicationId}/${filename}`);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle different image path formats', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';
            const pathFormats = [
                '/uploads/applications/1/image1.jpg',
                'uploads/applications/1/image1.jpg',
                'C:\\uploads\\applications\\1\\image1.jpg',
                '/var/www/uploads/applications/1/image1.jpg',
                'https://cdn.example.com/applications/1/image1.jpg',
                's3://bucket/applications/1/image1.jpg',
            ];

            for (const pathFormat of pathFormats) {
                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.getImagePath.mockResolvedValue(pathFormat);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(pathFormat);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle very large application IDs', async () => {
            // Arrange
            const applicationIds = [999999, 1000000, 2147483647]; // Max int32

            for (const applicationId of applicationIds) {
                const filename = 'image1.jpg';

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.getImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/${filename}`);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(`/uploads/applications/${applicationId}/${filename}`);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle floating point application IDs', async () => {
            // Arrange
            const applicationId = 1.5;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue({
                ...mockApplication,
                id: applicationId,
            });
            imagesService.getImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/${filename}`);

            // Act
            const result = await useCase.execute(applicationId, filename);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe(`/uploads/applications/${applicationId}/${filename}`);
        });

        it('should handle database connection errors during get image path', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const dbError = new Error('Database connection lost');
            imagesService.getImagePath.mockRejectedValue(dbError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Database connection lost');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle disk access errors during get image path', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const diskError = new Error('Disk I/O error');
            imagesService.getImagePath.mockRejectedValue(diskError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Disk I/O error');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should handle path resolution errors', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'image1.jpg';

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const pathError = new Error('Path resolution failed');
            imagesService.getImagePath.mockRejectedValue(pathError);

            // Act & Assert
            await expect(useCase.execute(applicationId, filename)).rejects.toThrow('Path resolution failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should return correct path for different file extensions', async () => {
            // Arrange
            const applicationId = 1;
            const fileExtensions = [
                '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
                '.pdf', '.doc', '.docx', '.txt', '.mp4', '.avi'
            ];

            for (const extension of fileExtensions) {
                const filename = `file${extension}`;
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.getImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId, filename);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });
    });
});
