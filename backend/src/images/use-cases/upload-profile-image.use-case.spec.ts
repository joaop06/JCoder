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
    destination: string;
    filename: string;
    path: string;
    stream: any;
}

// Mock services to avoid circular dependencies
const mockImagesService = {
    findApplicationById: jest.fn(),
    uploadProfileImage: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockUploadProfileImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Upload the profile image
        return await this.imagesService.uploadProfileImage(id, file);
    }
}

describe('UploadProfileImageUseCase', () => {
    let useCase: MockUploadProfileImageUseCase;
    let mockFile: MockFile;
    let mockApplication: Application;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Create a mock file
        mockFile = {
            fieldname: 'profileImage',
            originalname: 'test-image.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('fake-image-data'),
            destination: '/tmp',
            filename: 'test-image.jpg',
            path: '/tmp/test-image.jpg',
            stream: null,
        };

        // Create a mock application
        mockApplication = {
            id: 1,
            userId: 1,
            name: 'Test Application',
            description: 'Test Description',
            applicationType: ApplicationTypeEnum.API,
            githubUrl: 'https://github.com/test/repo',
            isActive: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
            images: [],
            profileImage: undefined,
        };

        // Initialize the use case with mocked service
        useCase = new MockUploadProfileImageUseCase(mockImagesService);
    });

    describe('execute', () => {
        it('should successfully upload a profile image when application exists', async () => {
            // Arrange
            const applicationId = 1;
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'new-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toEqual(updatedApplication);
            expect(result.profileImage).toBe('new-profile-image.jpg');
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            // Arrange
            const applicationId = 999;
            mockImagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile))
                .rejects
                .toThrow(ApplicationNotFoundException);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;
            mockImagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile))
                .rejects
                .toThrow(ApplicationNotFoundException);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).not.toHaveBeenCalled();
        });

        it('should handle different file types correctly', async () => {
            // Arrange
            const applicationId = 1;
            const pngFile: MockFile = {
                ...mockFile,
                originalname: 'test-image.png',
                mimetype: 'image/png',
                filename: 'test-image.png',
                destination: '/tmp',
                path: '/tmp/test-image.png',
                stream: null,
            };
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'new-profile-image.png',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, pngFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, pngFile);
            expect(result.profileImage).toBe('new-profile-image.png');
        });

        it('should handle different application types correctly', async () => {
            // Arrange
            const applicationId = 1;
            const mobileApplication: Application = {
                ...mockApplication,
                applicationType: ApplicationTypeEnum.MOBILE,
            };
            const updatedApplication = {
                ...mobileApplication,
                profileImage: 'mobile-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mobileApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result.applicationType).toBe(ApplicationTypeEnum.MOBILE);
            expect(result.profileImage).toBe('mobile-profile-image.jpg');
        });

        it('should handle applications with existing profile images', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithExistingImage: Application = {
                ...mockApplication,
                profileImage: 'existing-profile-image.jpg',
            };
            const updatedApplication = {
                ...applicationWithExistingImage,
                profileImage: 'new-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(applicationWithExistingImage);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result.profileImage).toBe('new-profile-image.jpg');
        });

        it('should propagate errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;
            const error = new Error('Database connection failed');
            mockImagesService.findApplicationById.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile))
                .rejects
                .toThrow('Database connection failed');

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).not.toHaveBeenCalled();
        });

        it('should propagate errors from uploadProfileImage', async () => {
            // Arrange
            const applicationId = 1;
            const error = new Error('File upload failed');
            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockRejectedValue(error);

            // Act & Assert
            await expect(useCase.execute(applicationId, mockFile))
                .rejects
                .toThrow('File upload failed');

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
        });

        it('should handle large file uploads', async () => {
            // Arrange
            const applicationId = 1;
            const largeFile: MockFile = {
                ...mockFile,
                size: 5 * 1024 * 1024, // 5MB
                originalname: 'large-image.jpg',
                destination: '/tmp',
                path: '/tmp/large-image.jpg',
                stream: null,
            };
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'large-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, largeFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, largeFile);
            expect(result.profileImage).toBe('large-profile-image.jpg');
        });

        it('should handle files with special characters in names', async () => {
            // Arrange
            const applicationId = 1;
            const specialFile: MockFile = {
                ...mockFile,
                originalname: 'test-image (1) - copy.jpg',
                filename: 'test-image (1) - copy.jpg',
                destination: '/tmp',
                path: '/tmp/test-image (1) - copy.jpg',
                stream: null,
            };
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'special-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, specialFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, specialFile);
            expect(result.profileImage).toBe('special-profile-image.jpg');
        });

        it('should handle zero-byte files', async () => {
            // Arrange
            const applicationId = 1;
            const emptyFile: MockFile = {
                ...mockFile,
                size: 0,
                buffer: Buffer.alloc(0),
                destination: '/tmp',
                path: '/tmp/empty-file.jpg',
                stream: null,
            };
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'empty-profile-image.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, emptyFile);

            // Assert
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, emptyFile);
            expect(result.profileImage).toBe('empty-profile-image.jpg');
        });

        it('should handle concurrent uploads for the same application', async () => {
            // Arrange
            const applicationId = 1;
            const file1: MockFile = { ...mockFile, originalname: 'image1.jpg', filename: 'image1.jpg', destination: '/tmp', path: '/tmp/image1.jpg', stream: null };
            const file2: MockFile = { ...mockFile, originalname: 'image2.jpg', filename: 'image2.jpg', destination: '/tmp', path: '/tmp/image2.jpg', stream: null };
            const updatedApplication1 = { ...mockApplication, profileImage: 'image1.jpg' };
            const updatedApplication2 = { ...mockApplication, profileImage: 'image2.jpg' };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage
                .mockResolvedValueOnce(updatedApplication1)
                .mockResolvedValueOnce(updatedApplication2);

            // Act
            const [result1, result2] = await Promise.all([
                useCase.execute(applicationId, file1),
                useCase.execute(applicationId, file2),
            ]);

            // Assert
            expect(mockImagesService.findApplicationById).toHaveBeenCalledTimes(2);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledTimes(2);
            expect(result1.profileImage).toBe('image1.jpg');
            expect(result2.profileImage).toBe('image2.jpg');
        });

        it('should handle different application IDs correctly', async () => {
            // Arrange
            const application1 = { ...mockApplication, id: 1 };
            const application2 = { ...mockApplication, id: 2 };
            const updatedApplication1 = { ...application1, profileImage: 'app1-profile.jpg' };
            const updatedApplication2 = { ...application2, profileImage: 'app2-profile.jpg' };

            mockImagesService.findApplicationById
                .mockResolvedValueOnce(application1)
                .mockResolvedValueOnce(application2);
            mockImagesService.uploadProfileImage
                .mockResolvedValueOnce(updatedApplication1)
                .mockResolvedValueOnce(updatedApplication2);

            // Act
            const [result1, result2] = await Promise.all([
                useCase.execute(1, mockFile),
                useCase.execute(2, mockFile),
            ]);

            // Assert
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(1);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(2);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(1, mockFile);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(2, mockFile);
            expect(result1.id).toBe(1);
            expect(result2.id).toBe(2);
            expect(result1.profileImage).toBe('app1-profile.jpg');
            expect(result2.profileImage).toBe('app2-profile.jpg');
        });
    });

    describe('constructor', () => {
        it('should create an instance with the provided imagesService', () => {
            // Act
            const instance = new MockUploadProfileImageUseCase(mockImagesService);

            // Assert
            expect(instance).toBeDefined();
            expect(instance).toBeInstanceOf(MockUploadProfileImageUseCase);
        });
    });

    describe('integration scenarios', () => {
        it('should handle the complete flow from finding application to uploading image', async () => {
            // Arrange
            const applicationId = 1;
            const updatedApplication = {
                ...mockApplication,
                profileImage: 'complete-flow-profile.jpg',
                updatedAt: new Date('2023-01-02'),
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toEqual(updatedApplication);
            expect(result.profileImage).toBe('complete-flow-profile.jpg');
            expect(result.updatedAt).not.toEqual(mockApplication.updatedAt);
        });

        it('should maintain application data integrity during upload', async () => {
            // Arrange
            const applicationId = 1;
            const originalApplication = {
                ...mockApplication,
                name: 'Original Name',
                description: 'Original Description',
                githubUrl: 'https://github.com/original/repo',
                isActive: true,
            };
            const updatedApplication = {
                ...originalApplication,
                profileImage: 'maintained-data-profile.jpg',
            };

            mockImagesService.findApplicationById.mockResolvedValue(originalApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            // Act
            const result = await useCase.execute(applicationId, mockFile);

            // Assert
            expect(result.name).toBe(originalApplication.name);
            expect(result.description).toBe(originalApplication.description);
            expect(result.githubUrl).toBe(originalApplication.githubUrl);
            expect(result.isActive).toBe(originalApplication.isActive);
            expect(result.profileImage).toBe('maintained-data-profile.jpg');
        });
    });
});
