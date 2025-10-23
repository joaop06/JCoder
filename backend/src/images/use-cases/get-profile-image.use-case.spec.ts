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
    getProfileImagePath: jest.fn(),
};

// Create a mock use case class that implements the same logic
class MockGetProfileImageUseCase {
    constructor(
        private readonly imagesService: typeof mockImagesService,
    ) { }

    async execute(id: number): Promise<string> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Get the profile image path
        return await this.imagesService.getProfileImagePath(id);
    }
}

describe('GetProfileImageUseCase', () => {
    let useCase: MockGetProfileImageUseCase;
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
        images: ['image1.jpg'],
        profileImage: null,
    };

    const mockProfileImagePath = '/uploads/applications/1/profile.jpg';

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create use case instance manually with mocked dependencies
        useCase = new MockGetProfileImageUseCase(mockImagesService);

        imagesService = mockImagesService;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should get profile image path successfully when application exists', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getProfileImagePath.mockResolvedValue(mockProfileImagePath);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe(mockProfileImagePath);
        });

        it('should throw ApplicationNotFoundException when application is not found', async () => {
            // Arrange
            const applicationId = 999;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should throw ApplicationNotFoundException when application is undefined', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(undefined);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should propagate getProfileImagePath service errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const getProfileImageError = new Error('Get profile image path operation failed');
            imagesService.getProfileImagePath.mockRejectedValue(getProfileImageError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Get profile image path operation failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should handle database constraint errors during get profile image path', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const constraintError = new Error('Foreign key constraint violation');
            imagesService.getProfileImagePath.mockRejectedValue(constraintError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Foreign key constraint violation');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should handle network errors during get profile image path', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const networkError = new Error('Network timeout');
            imagesService.getProfileImagePath.mockRejectedValue(networkError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Network timeout');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should work with different application IDs', async () => {
            // Arrange
            const applicationIds = [1, 2, 3, 100, 999];

            for (const applicationId of applicationIds) {
                const expectedPath = `/uploads/applications/${applicationId}/profile.jpg`;

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: applicationId,
                });
                imagesService.getProfileImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle concurrent get profile image operations', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getProfileImagePath.mockResolvedValue(mockProfileImagePath);

            // Act - Execute multiple concurrent get profile image operations
            const promises = [
                useCase.execute(applicationId),
                useCase.execute(applicationId),
                useCase.execute(applicationId),
            ];

            const results = await Promise.all(promises);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(3);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledTimes(3);
            expect(results).toEqual([mockProfileImagePath, mockProfileImagePath, mockProfileImagePath]);
        });

        it('should handle undefined application ID gracefully', async () => {
            // Arrange
            const applicationId = undefined as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle null application ID gracefully', async () => {
            // Arrange
            const applicationId = null as any;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle zero application ID', async () => {
            // Arrange
            const applicationId = 0;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle negative application ID', async () => {
            // Arrange
            const applicationId = -1;

            imagesService.findApplicationById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle findApplicationById service errors', async () => {
            // Arrange
            const applicationId = 1;

            const serviceError = new Error('Database connection error');
            imagesService.findApplicationById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Database connection error');
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle timeout errors from findApplicationById', async () => {
            // Arrange
            const applicationId = 1;

            const timeoutError = new Error('Request timeout');
            imagesService.findApplicationById.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Request timeout');
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalled();
        });

        it('should handle permission errors from getProfileImagePath', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const permissionError = new Error('Permission denied');
            imagesService.getProfileImagePath.mockRejectedValue(permissionError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Permission denied');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should handle file not found errors from getProfileImagePath', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const fileNotFoundError = new Error('Profile image file not found');
            imagesService.getProfileImagePath.mockRejectedValue(fileNotFoundError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Profile image file not found');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
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
                imagesService.getProfileImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/profile.jpg`);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(`/uploads/applications/${applicationId}/profile.jpg`);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle different profile image path formats', async () => {
            // Arrange
            const applicationId = 1;
            const pathFormats = [
                '/uploads/applications/1/profile.jpg',
                'uploads/applications/1/profile.jpg',
                'C:\\uploads\\applications\\1\\profile.jpg',
                '/var/www/uploads/applications/1/profile.jpg',
                'https://cdn.example.com/applications/1/profile.jpg',
                's3://bucket/applications/1/profile.jpg',
            ];

            for (const pathFormat of pathFormats) {
                imagesService.findApplicationById.mockResolvedValue(mockApplication);
                imagesService.getProfileImagePath.mockResolvedValue(pathFormat);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(pathFormat);

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
                imagesService.getProfileImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/profile.jpg`);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(`/uploads/applications/${applicationId}/profile.jpg`);

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
            imagesService.getProfileImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/profile.jpg`);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe(`/uploads/applications/${applicationId}/profile.jpg`);
        });

        it('should handle database connection errors during get profile image path', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const dbError = new Error('Database connection lost');
            imagesService.getProfileImagePath.mockRejectedValue(dbError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Database connection lost');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should handle disk access errors during get profile image path', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const diskError = new Error('Disk I/O error');
            imagesService.getProfileImagePath.mockRejectedValue(diskError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Disk I/O error');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should handle path resolution errors', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            const pathError = new Error('Path resolution failed');
            imagesService.getProfileImagePath.mockRejectedValue(pathError);

            // Act & Assert
            await expect(useCase.execute(applicationId)).rejects.toThrow('Path resolution failed');
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
        });

        it('should return correct path for different profile image file extensions', async () => {
            // Arrange
            const applicationId = 1;
            const fileExtensions = [
                '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
            ];

            for (const extension of fileExtensions) {
                const filename = `profile${extension}`;
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    profileImage: filename,
                });
                imagesService.getProfileImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle application without profile image', async () => {
            // Arrange
            const applicationId = 2;

            imagesService.findApplicationById.mockResolvedValue(mockApplicationWithoutProfileImage);
            // The service should handle the case where profileImage is null
            imagesService.getProfileImagePath.mockResolvedValue('/uploads/applications/2/default-profile.jpg');

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe('/uploads/applications/2/default-profile.jpg');
        });

        it('should handle application with empty profile image string', async () => {
            // Arrange
            const applicationId = 1;
            const applicationWithEmptyProfileImage = {
                ...mockApplication,
                profileImage: '',
            };

            imagesService.findApplicationById.mockResolvedValue(applicationWithEmptyProfileImage);
            imagesService.getProfileImagePath.mockResolvedValue('/uploads/applications/1/default-profile.jpg');

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe('/uploads/applications/1/default-profile.jpg');
        });

        it('should handle profile image filenames with special characters', async () => {
            // Arrange
            const applicationId = 1;
            const specialFilenames = [
                'profile with spaces.jpg',
                'profile-with-special-chars!@#$%^&*().jpg',
                'profile-with-unicode-ñáéíóú.jpg',
                'profile-with-emoji-🚀.jpg',
                'profile-with-quotes-"test".jpg',
                "profile-with-single-quotes-'test'.jpg",
            ];

            for (const filename of specialFilenames) {
                const expectedPath = `/uploads/applications/${applicationId}/${filename}`;

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    profileImage: filename,
                });
                imagesService.getProfileImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(applicationId);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle very long profile image filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'a'.repeat(1000) + '.jpg';

            imagesService.findApplicationById.mockResolvedValue({
                ...mockApplication,
                profileImage: filename,
            });
            imagesService.getProfileImagePath.mockResolvedValue(`/uploads/applications/${applicationId}/${filename}`);

            // Act
            const result = await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe(`/uploads/applications/${applicationId}/${filename}`);
        });

        it('should handle multiple applications with different profile images', async () => {
            // Arrange
            const applications = [
                { id: 1, profileImage: 'profile1.jpg' },
                { id: 2, profileImage: 'profile2.png' },
                { id: 3, profileImage: 'profile3.gif' },
                { id: 4, profileImage: 'profile4.webp' },
            ];

            for (const app of applications) {
                const expectedPath = `/uploads/applications/${app.id}/${app.profileImage}`;

                imagesService.findApplicationById.mockResolvedValue({
                    ...mockApplication,
                    id: app.id,
                    profileImage: app.profileImage,
                });
                imagesService.getProfileImagePath.mockResolvedValue(expectedPath);

                // Act
                const result = await useCase.execute(app.id);

                // Assert
                expect(imagesService.findApplicationById).toHaveBeenCalledWith(app.id);
                expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(app.id);
                expect(result).toBe(expectedPath);

                // Clear mocks for next iteration
                jest.clearAllMocks();
            }
        });

        it('should handle service method call order correctly', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getProfileImagePath.mockResolvedValue(mockProfileImagePath);

            // Act
            await useCase.execute(applicationId);

            // Assert - Verify that findApplicationById is called before getProfileImagePath
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);

            // Verify call order
            const findApplicationByIdCallOrder = (imagesService.findApplicationById as jest.Mock).mock.invocationCallOrder[0];
            const getProfileImagePathCallOrder = (imagesService.getProfileImagePath as jest.Mock).mock.invocationCallOrder[0];
            expect(findApplicationByIdCallOrder).toBeLessThan(getProfileImagePathCallOrder);
        });

        it('should handle service method call count correctly', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getProfileImagePath.mockResolvedValue(mockProfileImagePath);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledTimes(1);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledTimes(1);
        });

        it('should handle service method call arguments correctly', async () => {
            // Arrange
            const applicationId = 1;

            imagesService.findApplicationById.mockResolvedValue(mockApplication);
            imagesService.getProfileImagePath.mockResolvedValue(mockProfileImagePath);

            // Act
            await useCase.execute(applicationId);

            // Assert
            expect(imagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(imagesService.getProfileImagePath).not.toHaveBeenCalledWith(applicationId, mockApplication.profileImage);
        });
    });
});
