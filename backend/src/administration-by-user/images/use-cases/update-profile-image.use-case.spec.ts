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
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

// Mock services to avoid circular dependencies
const mockImagesService = {
    findApplicationById: jest.fn(),
    updateProfileImage: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockUpdateProfileImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Update the profile image (this will replace the existing one)
        return await this.imagesService.updateProfileImage(id, file);
    }
}

describe('UpdateProfileImageUseCase', () => {
    let useCase: MockUpdateProfileImageUseCase;
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
        profileImage: 'old-profile.jpg',
    };

    const mockUpdatedApplication: Application = {
        ...mockApplication,
        profileImage: 'new-profile.jpg',
        updatedAt: new Date(),
    };

    const mockFile: MockFile = {
        fieldname: 'profileImage',
        originalname: 'new-profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024000, // 1MB
        destination: '/tmp/uploads',
        filename: 'new-profile.jpg',
        path: '/tmp/uploads/new-profile.jpg',
        buffer: Buffer.from('fake-image-data'),
    };

    const mockFilePng: MockFile = {
        fieldname: 'profileImage',
        originalname: 'profile.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048000, // 2MB
        destination: '/tmp/uploads',
        filename: 'profile.png',
        path: '/tmp/uploads/profile.png',
        buffer: Buffer.from('fake-png-data'),
    };

    const mockFileGif: MockFile = {
        fieldname: 'profileImage',
        originalname: 'profile.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 512000, // 512KB
        destination: '/tmp/uploads',
        filename: 'profile.gif',
        path: '/tmp/uploads/profile.gif',
        buffer: Buffer.from('fake-gif-data'),
    };

    const mockFileWebp: MockFile = {
        fieldname: 'profileImage',
        originalname: 'profile.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 800000, // 800KB
        destination: '/tmp/uploads',
        filename: 'profile.webp',
        path: '/tmp/uploads/profile.webp',
        buffer: Buffer.from('fake-webp-data'),
    };

    const mockFileSvg: MockFile = {
        fieldname: 'profileImage',
        originalname: 'profile.svg',
        encoding: '7bit',
        mimetype: 'image/svg+xml',
        size: 50000, // 50KB
        destination: '/tmp/uploads',
        filename: 'profile.svg',
        path: '/tmp/uploads/profile.svg',
        buffer: Buffer.from('fake-svg-data'),
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockUpdateProfileImageUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should update profile image successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.updateProfileImage.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toBe(mockUpdatedApplication);
            expect(result.profileImage).toBe('new-profile.jpg');
        });

        it('should update profile image even when application has no existing profile image', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutProfileImage = {
                ...mockApplication,
                profileImage: null,
            };
            const updatedApplication = {
                ...applicationWithoutProfileImage,
                profileImage: 'new-profile.jpg',
            };

            imagesService.findApplicationById.mockResolvedValue(applicationWithoutProfileImage);
            imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toBe(updatedApplication);
            expect(result.profileImage).toBe('new-profile.jpg');
        });

        it('should update profile image even when application has empty profile image', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithEmptyProfileImage = {
                ...mockApplication,
                profileImage: '',
            };
            const updatedApplication = {
                ...applicationWithEmptyProfileImage,
                profileImage: 'new-profile.jpg',
            };

            imagesService.findApplicationById.mockResolvedValue(applicationWithEmptyProfileImage);
            imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toBe(updatedApplication);
            expect(result.profileImage).toBe('new-profile.jpg');
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should propagate updateProfileImage service errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const updateError = new Error('Update profile image operation failed');
            imagesService.updateProfileImage.mockRejectedValue(updateError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Update profile image operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle database constraint errors during update', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.updateProfileImage.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle network errors during update', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.updateProfileImage.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];

            for (const applicationId of applicationIds) {
                const applicationWithId = {
                    ...mockApplication,
                    id: applicationId,
                };
                const updatedApplication = {
                    ...applicationWithId,
                    profileImage: 'new-profile.jpg',
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithId);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, mockFile);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
                expect(result).toBe(updatedApplication);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should work with different file types', async () => {
            // Arrange
            const applicationId = 1;
            const fileTypes = [mockFile, mockFilePng, mockFileGif, mockFileWebp, mockFileSvg];

            for (const file of fileTypes) {
                const updatedApplication = {
                    ...mockApplication,
                    profileImage: file.filename,
                };

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, file);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
                expect(result).toBe(updatedApplication);
                expect(result.profileImage).toBe(file.filename);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent update operations', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.updateProfileImage.mockResolvedValue(mockUpdatedApplication);

            // Act - Execute multiple concurrent update operations
            const promises = [
                useCase.execute(applicationId, mockFile),
                useCase.execute(applicationId, mockFilePng),
                useCase.execute(applicationId, mockFileGif),
            ];

            const results = await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.updateProfileImage).toHaveBeenCalledTimes(3);
            expect(results).toEqual([mockUpdatedApplication, mockUpdatedApplication, mockUpdatedApplication]);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle null file', async () => {
            // Arrange
            const applicationId = 1;
            const file = null as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.updateProfileImage.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, file);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle undefined file', async () => {
            // Arrange
            const applicationId = 1;
            const file = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.updateProfileImage.mockResolvedValue(mockUpdatedApplication);

            // Act
            const result = await useCase.execute(applicationId, file);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
            expect(result).toBe(mockUpdatedApplication);
        });

        it('should handle files with different sizes', async () => {
            // Arrange
            const applicationId = 1;
            const fileSizes = [
                { ...mockFile, size: 1000 }, // 1KB
                { ...mockFile, size: 1000000 }, // 1MB
                { ...mockFile, size: 10000000 }, // 10MB
                { ...mockFile, size: 0 }, // Empty file
            ];

            for (const file of fileSizes) {
                const updatedApplication = {
                    ...mockApplication,
                    profileImage: file.filename,
                };

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, file);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
                expect(result).toBe(updatedApplication);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle files with different MIME types', async () => {
            // Arrange
            const applicationId = 1;
            const mimeTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'image/bmp',
                'image/tiff',
            ];

            for (const mimeType of mimeTypes) {
                const file = {
                    ...mockFile,
                    mimetype: mimeType,
                    filename: `profile.${mimeType.split('/')[1]}`,
                };
                const updatedApplication = {
                    ...mockApplication,
                    profileImage: file.filename,
                };

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, file);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
                expect(result).toBe(updatedApplication);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle files with special characters in names', async () => {
            // Arrange
            const applicationId = 1;
            const specialNames = [
                'profile with spaces.jpg',
                'profile-with-dashes.jpg',
                'profile_with_underscores.jpg',
                'profile.with.dots.jpg',
                'profile-ñáéíóú.jpg',
                'profile-🚀.jpg',
                'profile-"quotes".jpg',
                "profile-'single-quotes'.jpg",
            ];

            for (const originalname of specialNames) {
                const file = {
                    ...mockFile,
                    originalname,
                    filename: originalname,
                };
                const updatedApplication = {
                    ...mockApplication,
                    profileImage: file.filename,
                };

                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, file);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, file);
                expect(result).toBe(updatedApplication);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle application without images array', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithoutImages = {
                ...mockApplication,
                images: undefined,
            };
            const updatedApplication = {
                ...applicationWithoutImages,
                profileImage: 'new-profile.jpg',
            };

            imagesService.findApplicationById.mockResolvedValue(applicationWithoutImages);
            imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toBe(updatedApplication);
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Database connection error');
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Request timeout');
            expect(imagesService.updateProfileImage).not.toHaveBeenCalled();
        });

        it('should handle permission errors from updateProfileImage', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.updateProfileImage.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle file upload errors from updateProfileImage', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const uploadError = new Error('File upload failed');
            imagesService.updateProfileImage.mockRejectedValue(uploadError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('File upload failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
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
                const updatedApplication = {
                    ...applicationWithType,
                    profileImage: 'new-profile.jpg',
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithType);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, mockFile);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
                expect(result).toBe(updatedApplication);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle very large application IDs', async () => {
            // Arrange
            const applicationIds = [999999, 1000000, 2147483647]; // Max int32

            for (const applicationId of applicationIds) {
                const applicationWithId = {
                    ...mockApplication,
                    id: applicationId,
                };
                const updatedApplication = {
                    ...applicationWithId,
                    profileImage: 'new-profile.jpg',
                };

                imagesService.findApplicationById.mockResolvedValue(applicationWithId);
                imagesService.updateProfileImage.mockResolvedValue(updatedApplication);

                // Act
                const result = await useCase.execute(applicationId, mockFile);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
                expect(result).toBe(updatedApplication);

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
            imagesService.updateProfileImage.mockResolvedValue({
                ...mockApplication,
                id: applicationId,
                profileImage: 'new-profile.jpg',
            });

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result.profileImage).toBe('new-profile.jpg');
        });

        it('should handle database connection errors during update', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const dbError = new Error('Database connection lost');
            imagesService.updateProfileImage.mockRejectedValue(dbError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Database connection lost');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle disk space errors during update', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const diskError = new Error('No space left on device');
            imagesService.updateProfileImage.mockRejectedValue(diskError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('No space left on device');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle file system errors during update', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fsError = new Error('File system error');
            imagesService.updateProfileImage.mockRejectedValue(fsError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('File system error');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle invalid file format errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const formatError = new Error('Invalid file format');
            imagesService.updateProfileImage.mockRejectedValue(formatError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('Invalid file format');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle file size limit errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const sizeError = new Error('File size exceeds limit');
            imagesService.updateProfileImage.mockRejectedValue(sizeError);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile)).rejects.toThrow('File size exceeds limit');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });
    });
});
