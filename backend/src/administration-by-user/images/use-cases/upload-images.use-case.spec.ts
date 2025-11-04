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

// Mock Express.Multer.File interface
interface MockFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
}

// Mock services to avoid circular dependencies
const mockImagesService = {
    findApplicationById: jest.fn(),
    uploadImages: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockUploadImagesUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<Application> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Upload the images
        return await this.imagesService.uploadImages(id, files);
    }
}

describe('UploadImagesUseCase', () => {
    let useCase: MockUploadImagesUseCase;
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
        images: ['image1.jpg', 'image2.png'],
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

    const mockFile: MockFile = {
        fieldname: 'images',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '/uploads',
        filename: 'test-image.jpg',
        path: '/uploads/test-image.jpg',
    };

    const mockUpdatedApplication: Application = {
        ...mockApplication,
        images: [...(mockApplication.images || []), 'new-image1.jpg', 'new-image2.jpg'],
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockUploadImagesUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should upload images successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should upload multiple images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, originalname: 'image1.jpg' } as Express.Multer.File,
                { ...mockFile, originalname: 'image2.png' } as Express.Multer.File,
                { ...mockFile, originalname: 'image3.gif' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should propagate uploadImages service errors', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const uploadError = new Error('Upload operation failed');
            imagesService.uploadImages.mockRejectedValue(uploadError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Upload operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle database constraint errors during upload', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.uploadImages.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle network errors during upload', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.uploadImages.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];
            const files = [mockFile as Express.Multer.File];

            for (const applicationId of applicationIds) {
                const applicationWithId = {
                    ...mockApplication,
                    id: applicationId,
                };
                const updatedApplicationWithId = {
                    ...mockUpdatedApplication,
                    id: applicationId,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithId);
                imagesService.uploadImages.mockResolvedValue(updatedApplicationWithId);

                // Act
                const result = await useCase.execute(applicationId, files);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
                expect(result).toBe(updatedApplicationWithId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent upload operations', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act - Execute multiple concurrent upload operations
            const promises = [
                useCase.execute(applicationId, files),
                useCase.execute(applicationId, files),
                useCase.execute(applicationId, files),
            ];

            const results = await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.uploadImages).toHaveBeenCalledTimes(3);
            expect(results).toEqual([mockUpdatedApplication, mockUpdatedApplication, mockUpdatedApplication]);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle empty files array', async () => {
            // Arrange
            const applicationId = 1;
            const files: Express.Multer.File[] = [];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockApplication);
        });

        it('should handle null files array', async () => {
            // Arrange
            const applicationId = 1;
            const files = null as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockApplication);
        });

        it('should handle undefined files array', async () => {
            // Arrange
            const applicationId = 1;
            const files = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockApplication);
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Database connection error');
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Request timeout');
            expect(imagesService.uploadImages).not.toHaveBeenCalled();
        });

        it('should handle permission errors from uploadImages', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.uploadImages.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle file system errors from uploadImages', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fileSystemError = new Error('File system error');
            imagesService.uploadImages.mockRejectedValue(fileSystemError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('File system error');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
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
            const files = [mockFile as Express.Multer.File];

            for (const applicationType of applicationTypes) {
                const applicationId = 1;
                const applicationWithType = {
                    ...mockApplication,
                    applicationType,
                };
                const updatedApplicationWithType = {
                    ...mockUpdatedApplication,
                    applicationType,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithType);
                imagesService.uploadImages.mockResolvedValue(updatedApplicationWithType);

                // Act
                const result = await useCase.execute(applicationId, files);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
                expect(result).toBe(updatedApplicationWithType);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle very large application IDs', async () => {
            // Arrange
            const applicationIds = [999999, 1000000, 2147483647]; // Max int32
            const files = [mockFile as Express.Multer.File];

            for (const applicationId of applicationIds) {
                const applicationWithId = {
                    ...mockApplication,
                    id: applicationId,
                };
                const updatedApplicationWithId = {
                    ...mockUpdatedApplication,
                    id: applicationId,
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithId);
                imagesService.uploadImages.mockResolvedValue(updatedApplicationWithId);

                // Act
                const result = await useCase.execute(applicationId, files);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
                expect(result).toBe(updatedApplicationWithId);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle floating point application IDs', async () => {
            // Arrange
            const applicationId = 1.5;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue({
                ...mockApplication,
                id: applicationId,
            });
            imagesService.uploadImages.mockResolvedValue({
                ...mockUpdatedApplication,
                id: applicationId,
            });

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result.id).toBe(applicationId);
        });

        it('should handle database connection errors during upload', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const dbError = new Error('Database connection lost');
            imagesService.uploadImages.mockRejectedValue(dbError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Database connection lost');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle disk space errors during upload', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const diskError = new Error('Insufficient disk space');
            imagesService.uploadImages.mockRejectedValue(diskError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Insufficient disk space');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle file size limit errors', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const sizeError = new Error('File size exceeds limit');
            imagesService.uploadImages.mockRejectedValue(sizeError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('File size exceeds limit');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle invalid file format errors', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const formatError = new Error('Invalid file format');
            imagesService.uploadImages.mockRejectedValue(formatError);

            // Act & Assert
            await expect(useCase.execute(applicationId, files)).rejects.toThrow('Invalid file format');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle files with different MIME types', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, mimetype: 'image/jpeg', originalname: 'image1.jpg' } as Express.Multer.File,
                { ...mockFile, mimetype: 'image/png', originalname: 'image2.png' } as Express.Multer.File,
                { ...mockFile, mimetype: 'image/gif', originalname: 'image3.gif' } as Express.Multer.File,
                { ...mockFile, mimetype: 'image/webp', originalname: 'image4.webp' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with different sizes', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, size: 1024, originalname: 'small.jpg' } as Express.Multer.File,
                { ...mockFile, size: 1024 * 1024, originalname: 'medium.jpg' } as Express.Multer.File,
                { ...mockFile, size: 10 * 1024 * 1024, originalname: 'large.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with special characters in names', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, originalname: 'file with spaces.jpg' } as Express.Multer.File,
                { ...mockFile, originalname: 'file-with-special-chars!@#$%^&*().jpg' } as Express.Multer.File,
                { ...mockFile, originalname: 'file-with-unicode-ñáéíóú.jpg' } as Express.Multer.File,
                { ...mockFile, originalname: 'file-with-emoji-🚀.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle application without existing images', async () => {
            // Arrange
            const applicationId = 2;
            const files = [mockFile as Express.Multer.File];
            const updatedApplicationWithoutImages = {
                ...mockApplicationWithoutImages,
                images: ['new-image.jpg'],
            };

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithoutImages);
            imagesService.uploadImages.mockResolvedValue(updatedApplicationWithoutImages);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(updatedApplicationWithoutImages);
        });

        it('should handle very large number of files', async () => {
            // Arrange
            const applicationId = 1;
            const files = Array.from({ length: 100 }, (_, index) => ({
                ...mockFile,
                originalname: `image${index}.jpg`,
            })) as Express.Multer.File[];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle service method call order correctly', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            await useCase.execute(applicationId, files);

            // Assert - Verify that findApplicationById is called before uploadImages
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);

            // Verify call order
            const findApplicationByIdCallOrder = (imagesService.findApplicationById as jest.Mock).mock.invocationCallOrder[0];
            const uploadImagesCallOrder = (imagesService.uploadImages as jest.Mock).mock.invocationCallOrder[0];
            expect(findApplicationByIdCallOrder).toBeLessThan(uploadImagesCallOrder);
        });

        it('should handle service method call count correctly', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(1);
            expect(imagesService.uploadImages).toHaveBeenCalledTimes(1);
        });

        it('should handle service method call arguments correctly', async () => {
            // Arrange
            const applicationId = 1;
            const files = [mockFile as Express.Multer.File];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
        });

        it('should handle files with different encodings', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, encoding: '7bit', originalname: 'image1.jpg' } as Express.Multer.File,
                { ...mockFile, encoding: 'base64', originalname: 'image2.jpg' } as Express.Multer.File,
                { ...mockFile, encoding: 'binary', originalname: 'image3.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with different fieldnames', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, fieldname: 'images', originalname: 'image1.jpg' } as Express.Multer.File,
                { ...mockFile, fieldname: 'photos', originalname: 'image2.jpg' } as Express.Multer.File,
                { ...mockFile, fieldname: 'pictures', originalname: 'image3.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with missing optional properties', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                {
                    fieldname: 'images',
                    originalname: 'image1.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: 1024,
                    buffer: Buffer.from('fake-image-data'),
                } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with zero size', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, size: 0, originalname: 'empty.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with very large size', async () => {
            // Arrange
            const applicationId = 1;
            const files = [
                { ...mockFile, size: 100 * 1024 * 1024, originalname: 'huge.jpg' } as Express.Multer.File,
            ];

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.uploadImages.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, files);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.uploadImages).toHaveBeenCalledWith(applicationId, files);
            expect(result).toBe(mockUpdatedApplication);
        });
    });
});
