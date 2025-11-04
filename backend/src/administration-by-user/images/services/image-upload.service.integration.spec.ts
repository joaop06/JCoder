import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock Sharp to avoid actual image processing in tests
jest.mock('sharp', () => {
    const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
    };

    return jest.fn(() => mockSharpInstance);
});

// Mock fs/promises
jest.mock('fs/promises', () => ({
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
    rmdir: jest.fn(),
    rm: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-123'),
}));

describe('ImageUploadService Integration', () => {
    let service: ImageUploadService;
    let configService: ConfigService;
    let module: TestingModule;

    // Test configuration
    const testUploadPath = './test-uploads';
    const testMaxFileSize = 5 * 1024 * 1024; // 5MB
    const testAllowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Mock files for testing
    const createMockFile = (mimetype: string, size: number, buffer?: Buffer): Express.Multer.File => ({
        fieldname: 'images',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype,
        size,
        buffer: buffer || Buffer.from('test-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
    });

    const validImageFile = createMockFile('image/jpeg', 1024 * 1024); // 1MB
    const largeImageFile = createMockFile('image/jpeg', 10 * 1024 * 1024); // 10MB
    const invalidMimeTypeFile = createMockFile('text/plain', 1024);
    const pngFile = createMockFile('image/png', 1024 * 1024);
    const webpFile = createMockFile('image/webp', 1024 * 1024);

    beforeEach(async () => {
        // Clear all mocks
        jest.clearAllMocks();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
            ],
            providers: [
                {
                    provide: ImageUploadService,
                    useFactory: (configService: ConfigService) => {
                        // Create service with mocked config
                        const service = new ImageUploadService(configService);
                        // Override the private properties with test values
                        (service as any).uploadPath = testUploadPath;
                        (service as any).maxFileSize = testMaxFileSize;
                        (service as any).allowedMimeTypes = testAllowedMimeTypes;
                        return service;
                    },
                    inject: [ConfigService],
                },
            ],
        }).compile();

        module = moduleFixture;
        service = module.get<ImageUploadService>(ImageUploadService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(async () => {
        await module.close();
    });

    describe('Service Initialization', () => {
        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        it('should initialize with correct configuration', () => {
            expect(service['uploadPath']).toBe(testUploadPath);
            expect(service['maxFileSize']).toBe(testMaxFileSize);
            expect(service['allowedMimeTypes']).toEqual(testAllowedMimeTypes);
        });
    });

    describe('File Validation', () => {
        it('should throw BadRequestException for invalid MIME types', async () => {
            const files = [invalidMimeTypeFile];

            await expect(service.uploadImages(files, 1)).rejects.toThrow(
                new BadRequestException(
                    `Invalid file type: text/plain. Allowed types: ${testAllowedMimeTypes.join(', ')}`
                )
            );
        });

        it('should throw BadRequestException for files exceeding size limit', async () => {
            const files = [largeImageFile];

            await expect(service.uploadImages(files, 1)).rejects.toThrow(
                new BadRequestException(
                    `File too large: ${largeImageFile.size} bytes. Maximum size: ${testMaxFileSize} bytes`
                )
            );
        });

        it('should validate mixed valid and invalid files', async () => {
            const files = [validImageFile, invalidMimeTypeFile];

            await expect(service.uploadImages(files, 1)).rejects.toThrow(BadRequestException);
        });
    });

    describe('Directory Management', () => {
        it('should create upload directory if it does not exist', async () => {
            const applicationId = 1;
            const files = [validImageFile];

            // Mock directory doesn't exist
            (fs.access as jest.Mock).mockRejectedValue(new Error('Directory not found'));

            // Mock Sharp to work properly
            const sharp = require('sharp');
            sharp.mockImplementation(() => ({
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
            }));

            await service.uploadImages(files, applicationId);

            expect(fs.mkdir).toHaveBeenCalledWith(
                path.join(testUploadPath, applicationId.toString()),
                { recursive: true }
            );
        });

        it('should not create directory if it already exists', async () => {
            const applicationId = 1;
            const files = [validImageFile];

            // Mock directory exists
            (fs.access as jest.Mock).mockResolvedValue(undefined);

            // Mock Sharp to work properly
            const sharp = require('sharp');
            sharp.mockImplementation(() => ({
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
            }));

            await service.uploadImages(files, applicationId);

            expect(fs.mkdir).not.toHaveBeenCalled();
        });
    });

    describe('Image Upload', () => {
        it('should return empty array for no files', async () => {
            const result = await service.uploadImages([], 1);
            expect(result).toEqual([]);
        });

        it('should return empty array for null/undefined files', async () => {
            const result = await service.uploadImages(null as any, 1);
            expect(result).toEqual([]);
        });
    });

    describe('Profile Image Upload', () => {
        it('should validate profile image file', async () => {
            const applicationId = 1;
            const file = invalidMimeTypeFile;

            await expect(service.uploadProfileImage(file, applicationId)).rejects.toThrow(
                new BadRequestException(
                    `Invalid file type: text/plain. Allowed types: ${testAllowedMimeTypes.join(', ')}`
                )
            );
        });
    });

    describe('Image Retrieval', () => {
        it('should return image path for existing image', async () => {
            const applicationId = 1;
            const filename = 'test-image.jpg';
            const expectedPath = path.join(testUploadPath, applicationId.toString(), filename);

            // Mock file exists
            (fs.access as jest.Mock).mockResolvedValue(undefined);

            const result = await service.getImagePath(applicationId, filename);

            expect(result).toBe(expectedPath);
            expect(fs.access).toHaveBeenCalledWith(expectedPath);
        });

        it('should throw BadRequestException for non-existent image', async () => {
            const applicationId = 1;
            const filename = 'non-existent.jpg';

            // Mock file doesn't exist
            (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));

            await expect(service.getImagePath(applicationId, filename)).rejects.toThrow(
                new BadRequestException(`Image not found: ${filename}`)
            );
        });

        it('should return profile image path using same method', async () => {
            const applicationId = 1;
            const filename = 'profile-test.jpg';
            const expectedPath = path.join(testUploadPath, applicationId.toString(), filename);

            // Mock file exists
            (fs.access as jest.Mock).mockResolvedValue(undefined);

            const result = await service.getProfileImagePath(applicationId, filename);

            expect(result).toBe(expectedPath);
        });
    });

    describe('Image Deletion', () => {
        it('should delete specific application images', async () => {
            const applicationId = 1;
            const filenames = ['image1.jpg', 'image2.jpg'];

            await service.deleteApplicationImages(applicationId, filenames);

            expect(fs.unlink).toHaveBeenCalledTimes(2);
            expect(fs.unlink).toHaveBeenCalledWith(
                path.join(testUploadPath, applicationId.toString(), 'image1.jpg')
            );
            expect(fs.unlink).toHaveBeenCalledWith(
                path.join(testUploadPath, applicationId.toString(), 'image2.jpg')
            );
        });

        it('should handle deletion of non-existent files gracefully', async () => {
            const applicationId = 1;
            const filenames = ['non-existent.jpg'];

            // Mock unlink to throw error
            (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

            // Should not throw error
            await expect(service.deleteApplicationImages(applicationId, filenames)).resolves.not.toThrow();
        });

        it('should remove empty application directory after deleting all images', async () => {
            const applicationId = 1;
            const filenames = ['image1.jpg'];

            // Mock directory is empty after deletion
            (fs.readdir as jest.Mock).mockResolvedValue([]);

            await service.deleteApplicationImages(applicationId, filenames);

            expect(fs.rmdir).toHaveBeenCalledWith(
                path.join(testUploadPath, applicationId.toString())
            );
        });

        it('should not remove directory if it still contains files', async () => {
            const applicationId = 1;
            const filenames = ['image1.jpg'];

            // Mock directory still has files
            (fs.readdir as jest.Mock).mockResolvedValue(['image2.jpg']);

            await service.deleteApplicationImages(applicationId, filenames);

            expect(fs.rmdir).not.toHaveBeenCalled();
        });

        it('should handle empty filenames array', async () => {
            const applicationId = 1;

            await service.deleteApplicationImages(applicationId, []);

            expect(fs.unlink).not.toHaveBeenCalled();
        });

        it('should handle null/undefined filenames', async () => {
            const applicationId = 1;

            await service.deleteApplicationImages(applicationId, null as any);

            expect(fs.unlink).not.toHaveBeenCalled();
        });

        it('should delete all application images recursively', async () => {
            const applicationId = 1;

            await service.deleteAllApplicationImages(applicationId);

            expect(fs.rm).toHaveBeenCalledWith(
                path.join(testUploadPath, applicationId.toString()),
                { recursive: true, force: true }
            );
        });

        it('should handle deletion of non-existent directory gracefully', async () => {
            const applicationId = 1;

            // Mock rm to throw error
            (fs.rm as jest.Mock).mockRejectedValue(new Error('Directory not found'));

            // Should not throw error
            await expect(service.deleteAllApplicationImages(applicationId)).resolves.not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle file system errors during directory creation', async () => {
            const applicationId = 1;
            const files = [validImageFile];

            // Mock directory doesn't exist and mkdir fails
            (fs.access as jest.Mock).mockRejectedValue(new Error('Directory not found'));
            (fs.mkdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

            await expect(service.uploadImages(files, applicationId)).rejects.toThrow();
        });
    });

    describe('Configuration Integration', () => {
        it('should use fixed storage path from module', () => {
            const mockConfigService = {
                get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
                    return defaultValue;
                }),
            } as any;

            // Create new service instance
            const service = new ImageUploadService(mockConfigService);
            // Path should be fixed relative to the images module
            expect(service['uploadPath']).toContain('administration-by-user/images/storage/applications');
        });

        it('should use custom max file size from configuration', () => {
            const customMaxSize = 10 * 1024 * 1024; // 10MB
            const mockConfigService = {
                get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
                    if (key === 'MAX_FILE_SIZE') return customMaxSize;
                    return defaultValue;
                }),
            } as any;

            // Create new service instance with custom config
            const customService = new ImageUploadService(mockConfigService);
            expect(customService['maxFileSize']).toBe(customMaxSize);
        });

        it('should use default values when configuration is not provided', () => {
            const mockConfigService = {
                get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
                    // Return undefined for all keys, which should trigger default values
                    return defaultValue;
                }),
            } as any;

            // Create new service instance with no config
            const defaultService = new ImageUploadService(mockConfigService);
            expect(defaultService['uploadPath']).toContain('administration-by-user/images/storage/applications');
            expect(defaultService['maxFileSize']).toBe(5 * 1024 * 1024);
        });
    });
});