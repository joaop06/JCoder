import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';
import { ApplicationTypeEnum } from '../../applications/enums/application-type.enum';

// Mock Application entity
class MockApplication {
    id: number;
    userId: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// Mock ImagesService interface
interface MockImagesService {
    findApplicationById(id: number): Promise<MockApplication | null>;
    uploadProfileImage(id: number, file: Express.Multer.File): Promise<MockApplication>;
    updateProfileImage(id: number, file: Express.Multer.File): Promise<MockApplication>;
    uploadImages(id: number, files: Express.Multer.File[]): Promise<MockApplication>;
    deleteImage(id: number, filename: string): Promise<void>;
    deleteProfileImage(id: number): Promise<void>;
    getImagePath(id: number, filename: string): Promise<string>;
    getProfileImagePath(id: number): Promise<string>;
}

// Mock Use Cases
class MockUploadProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, file: Express.Multer.File): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.uploadProfileImage(id, file);
    }
}

class MockGetImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, filename: string): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.getImagePath(id, filename);
    }
}

class MockGetProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.getProfileImagePath(id);
    }
}

class MockUpdateProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, file: Express.Multer.File): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.updateProfileImage(id, file);
    }
}

class MockUploadImagesUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<MockApplication> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        return await this.imagesService.uploadImages(id, files);
    }
}

class MockDeleteImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number, filename: string): Promise<void> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        await this.imagesService.deleteImage(id, filename);
    }
}

class MockDeleteProfileImageUseCase {
    constructor(private readonly imagesService: MockImagesService) { }

    async execute(id: number): Promise<void> {
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();
        await this.imagesService.deleteProfileImage(id);
    }
}

describe('Images Use Cases Unit Tests', () => {
    let mockImagesService: jest.Mocked<MockImagesService>;
    let uploadProfileImageUseCase: MockUploadProfileImageUseCase;
    let getImageUseCase: MockGetImageUseCase;
    let getProfileImageUseCase: MockGetProfileImageUseCase;
    let updateProfileImageUseCase: MockUpdateProfileImageUseCase;
    let uploadImagesUseCase: MockUploadImagesUseCase;
    let deleteImageUseCase: MockDeleteImageUseCase;
    let deleteProfileImageUseCase: MockDeleteProfileImageUseCase;

    const mockApplication: MockApplication = {
        id: 1,
        userId: 1,
        name: 'Test Application',
        description: 'Test Description',
        applicationType: ApplicationTypeEnum.API,
        githubUrl: 'https://github.com/test/app',
        isActive: true,
        images: ['image1.jpg', 'image2.png'],
        profileImage: 'profile.png',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    const mockFile: Express.Multer.File = {
        fieldname: 'profileImage',
        originalname: 'new-profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
    };

    const mockFiles: Express.Multer.File[] = [
        {
            fieldname: 'images',
            originalname: 'test1.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('fake-image-data-1'),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
        },
        {
            fieldname: 'images',
            originalname: 'test2.png',
            encoding: '7bit',
            mimetype: 'image/png',
            size: 2048,
            buffer: Buffer.from('fake-image-data-2'),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
        },
    ];

    beforeEach(() => {
        mockImagesService = {
            findApplicationById: jest.fn(),
            uploadProfileImage: jest.fn(),
            updateProfileImage: jest.fn(),
            uploadImages: jest.fn(),
            deleteImage: jest.fn(),
            deleteProfileImage: jest.fn(),
            getImagePath: jest.fn(),
            getProfileImagePath: jest.fn(),
        };

        uploadProfileImageUseCase = new MockUploadProfileImageUseCase(mockImagesService);
        getImageUseCase = new MockGetImageUseCase(mockImagesService);
        getProfileImageUseCase = new MockGetProfileImageUseCase(mockImagesService);
        updateProfileImageUseCase = new MockUpdateProfileImageUseCase(mockImagesService);
        uploadImagesUseCase = new MockUploadImagesUseCase(mockImagesService);
        deleteImageUseCase = new MockDeleteImageUseCase(mockImagesService);
        deleteProfileImageUseCase = new MockDeleteProfileImageUseCase(mockImagesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('UploadProfileImageUseCase', () => {
        it('should upload profile image successfully when application exists', async () => {
            const applicationId = 1;
            const updatedApplication = { ...mockApplication, profileImage: 'new-profile.jpg' };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            const result = await uploadProfileImageUseCase.execute(applicationId, mockFile);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toEqual(updatedApplication);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(uploadProfileImageUseCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadProfileImage).not.toHaveBeenCalled();
        });
    });

    describe('GetImageUseCase', () => {
        it('should return image path when application exists and image is found', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';
            const expectedPath = '/uploads/applications/1/image1.jpg';

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.getImagePath.mockResolvedValue(expectedPath);

            const result = await getImageUseCase.execute(applicationId, filename);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.getImagePath).toHaveBeenCalledWith(applicationId, filename);
            expect(result).toBe(expectedPath);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;
            const filename = 'image1.jpg';

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(getImageUseCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.getImagePath).not.toHaveBeenCalled();
        });
    });

    describe('GetProfileImageUseCase', () => {
        it('should return profile image path when application exists and has profile image', async () => {
            const applicationId = 1;
            const expectedPath = '/uploads/applications/1/profile.png';

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.getProfileImagePath.mockResolvedValue(expectedPath);

            const result = await getProfileImageUseCase.execute(applicationId);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.getProfileImagePath).toHaveBeenCalledWith(applicationId);
            expect(result).toBe(expectedPath);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(getProfileImageUseCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.getProfileImagePath).not.toHaveBeenCalled();
        });
    });

    describe('UpdateProfileImageUseCase', () => {
        it('should update profile image successfully when application exists', async () => {
            const applicationId = 1;
            const updatedApplication = { ...mockApplication, profileImage: 'updated-profile.jpg' };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.updateProfileImage.mockResolvedValue(updatedApplication);

            const result = await updateProfileImageUseCase.execute(applicationId, mockFile);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.updateProfileImage).toHaveBeenCalledWith(applicationId, mockFile);
            expect(result).toEqual(updatedApplication);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(updateProfileImageUseCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.updateProfileImage).not.toHaveBeenCalled();
        });
    });

    describe('UploadImagesUseCase', () => {
        it('should upload images successfully when application exists', async () => {
            const applicationId = 1;
            const updatedApplication = {
                ...mockApplication,
                images: [...mockApplication.images!, 'new1.jpg', 'new2.jpg']
            };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadImages.mockResolvedValue(updatedApplication);

            const result = await uploadImagesUseCase.execute(applicationId, mockFiles);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadImages).toHaveBeenCalledWith(applicationId, mockFiles);
            expect(result).toEqual(updatedApplication);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(uploadImagesUseCase.execute(applicationId, mockFiles)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.uploadImages).not.toHaveBeenCalled();
        });
    });

    describe('DeleteImageUseCase', () => {
        it('should delete image successfully when application exists and image is found', async () => {
            const applicationId = 1;
            const filename = 'image1.jpg';

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.deleteImage.mockResolvedValue(undefined);

            await deleteImageUseCase.execute(applicationId, filename);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.deleteImage).toHaveBeenCalledWith(applicationId, filename);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;
            const filename = 'image1.jpg';

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(deleteImageUseCase.execute(applicationId, filename)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.deleteImage).not.toHaveBeenCalled();
        });
    });

    describe('DeleteProfileImageUseCase', () => {
        it('should delete profile image successfully when application exists and has profile image', async () => {
            const applicationId = 1;

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.deleteProfileImage.mockResolvedValue(undefined);

            await deleteProfileImageUseCase.execute(applicationId);

            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.deleteProfileImage).toHaveBeenCalledWith(applicationId);
        });

        it('should throw ApplicationNotFoundException when application does not exist', async () => {
            const applicationId = 999;

            mockImagesService.findApplicationById.mockResolvedValue(null);

            await expect(deleteProfileImageUseCase.execute(applicationId)).rejects.toThrow(ApplicationNotFoundException);
            expect(mockImagesService.findApplicationById).toHaveBeenCalledWith(applicationId);
            expect(mockImagesService.deleteProfileImage).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should propagate errors from service methods', async () => {
            const applicationId = 1;
            const error = new Error('Service error');

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadProfileImage.mockRejectedValue(error);

            await expect(uploadProfileImageUseCase.execute(applicationId, mockFile)).rejects.toThrow('Service error');
        });

        it('should handle undefined application from findApplicationById', async () => {
            const applicationId = 1;

            mockImagesService.findApplicationById.mockResolvedValue(undefined as any);

            await expect(uploadProfileImageUseCase.execute(applicationId, mockFile)).rejects.toThrow(ApplicationNotFoundException);
        });
    });

    describe('Edge Cases', () => {
        it('should handle applications with no existing images', async () => {
            const applicationId = 1;
            const applicationWithoutImages = { ...mockApplication, images: undefined as string[] | undefined };
            const updatedApplication = {
                ...applicationWithoutImages,
                images: ['new1.jpg', 'new2.jpg']
            };

            mockImagesService.findApplicationById.mockResolvedValue(applicationWithoutImages);
            mockImagesService.uploadImages.mockResolvedValue(updatedApplication);

            const result = await uploadImagesUseCase.execute(applicationId, mockFiles);

            expect(result).toEqual(updatedApplication);
        });

        it('should handle applications with no profile image', async () => {
            const applicationId = 1;
            const applicationWithoutProfile = { ...mockApplication, profileImage: undefined as string | undefined };
            const updatedApplication = { ...applicationWithoutProfile, profileImage: 'new-profile.jpg' };

            mockImagesService.findApplicationById.mockResolvedValue(applicationWithoutProfile);
            mockImagesService.uploadProfileImage.mockResolvedValue(updatedApplication);

            const result = await uploadProfileImageUseCase.execute(applicationId, mockFile);

            expect(result).toEqual(updatedApplication);
        });

        it('should handle empty files array', async () => {
            const applicationId = 1;
            const updatedApplication = { ...mockApplication };

            mockImagesService.findApplicationById.mockResolvedValue(mockApplication);
            mockImagesService.uploadImages.mockResolvedValue(updatedApplication);

            const result = await uploadImagesUseCase.execute(applicationId, []);

            expect(mockImagesService.uploadImages).toHaveBeenCalledWith(applicationId, []);
            expect(result).toEqual(updatedApplication);
        });
    });
});
