import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

// Mock fs/promises
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock sharp
jest.mock('sharp');
const mockedSharp = sharp as jest.Mocked<typeof sharp>;

// Mock path
jest.mock('path');
const mockedPath = path as jest.Mocked<typeof path>;

describe('ImageUploadService', () => {
    let service: ImageUploadService;
    let configService: ConfigService;

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockFile: Express.Multer.File = {
        fieldname: 'images',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test-image-data'),
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
    };

    const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageUploadService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<ImageUploadService>(ImageUploadService);
        configService = module.get<ConfigService>(ConfigService);

        // Setup default config values
        mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
            const config = {
                UPLOAD_PATH: './uploads/applications',
                MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
            };
            return config[key] || defaultValue;
        });

        // Setup sharp mock
        mockedSharp.mockReturnValue(mockSharpInstance as any);
        mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('processed-image-data'));

        // Setup path mock
        mockedPath.join.mockImplementation((...args) => args.join('/'));
        mockedPath.extname.mockReturnValue('.jpg');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadImages', () => {
        it('should upload images successfully', async () => {
            // Arrange
            const files = [mockFile];
            const applicationId = 1;
            const expectedFilename = 'uuid-generated-filename.jpg';

            // Mock uuid generation
            jest.spyOn(require('uuid'), 'v4').mockReturnValue('uuid-generated-filename');

            mockedFs.access.mockRejectedValue(new Error('Directory does not exist'));
            mockedFs.mkdir.mockResolvedValue(undefined);
            mockedFs.writeFile.mockResolvedValue(undefined);

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(expectedFilename);
            expect(mockedFs.mkdir).toHaveBeenCalledWith('./uploads/applications/1', { recursive: true });
            expect(mockedFs.writeFile).toHaveBeenCalledWith(
                './uploads/applications/1/uuid-generated-filename.jpg',
                Buffer.from('processed-image-data')
            );
        });

        it('should return empty array when no files provided', async () => {
            // Arrange
            const files: Express.Multer.File[] = [];
            const applicationId = 1;

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toEqual([]);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
            expect(mockedFs.writeFile).not.toHaveBeenCalled();
        });

        it('should return empty array when files is null', async () => {
            // Arrange
            const files = null as any;
            const applicationId = 1;

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toEqual([]);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
            expect(mockedFs.writeFile).not.toHaveBeenCalled();
        });

        it('should return empty array when files is undefined', async () => {
            // Arrange
            const files = undefined as any;
            const applicationId = 1;

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toEqual([]);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
            expect(mockedFs.writeFile).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid file type', async () => {
            // Arrange
            const invalidFile = {
                ...mockFile,
                mimetype: 'text/plain',
            };
            const files = [invalidFile];
            const applicationId = 1;

            // Act & Assert
            await expect(service.uploadImages(files, applicationId)).rejects.toThrow(BadRequestException);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for file too large', async () => {
            // Arrange
            const largeFile = {
                ...mockFile,
                size: 10 * 1024 * 1024, // 10MB
            };
            const files = [largeFile];
            const applicationId = 1;

            // Act & Assert
            await expect(service.uploadImages(files, applicationId)).rejects.toThrow(BadRequestException);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
        });

        it('should process multiple files successfully', async () => {
            // Arrange
            const files = [
                { ...mockFile, originalname: 'image1.jpg' },
                { ...mockFile, originalname: 'image2.png', mimetype: 'image/png' },
                { ...mockFile, originalname: 'image3.webp', mimetype: 'image/webp' },
            ];
            const applicationId = 1;

            // Mock uuid generation
            jest.spyOn(require('uuid'), 'v4')
                .mockReturnValueOnce('uuid1')
                .mockReturnValueOnce('uuid2')
                .mockReturnValueOnce('uuid3');

            mockedFs.access.mockRejectedValue(new Error('Directory does not exist'));
            mockedFs.mkdir.mockResolvedValue(undefined);
            mockedFs.writeFile.mockResolvedValue(undefined);

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toHaveLength(3);
            expect(result).toEqual(['uuid1.jpg', 'uuid2.png', 'uuid3.webp']);
            expect(mockedFs.writeFile).toHaveBeenCalledTimes(3);
        });

        it('should handle directory already exists', async () => {
            // Arrange
            const files = [mockFile];
            const applicationId = 1;

            jest.spyOn(require('uuid'), 'v4').mockReturnValue('uuid-generated-filename');

            mockedFs.access.mockResolvedValue(undefined); // Directory exists
            mockedFs.writeFile.mockResolvedValue(undefined);

            // Act
            const result = await service.uploadImages(files, applicationId);

            // Assert
            expect(result).toHaveLength(1);
            expect(mockedFs.mkdir).not.toHaveBeenCalled();
            expect(mockedFs.writeFile).toHaveBeenCalled();
        });

        it('should throw BadRequestException when image processing fails', async () => {
            // Arrange
            const files = [mockFile];
            const applicationId = 1;

            jest.spyOn(require('uuid'), 'v4').mockReturnValue('uuid-generated-filename');

            mockedFs.access.mockRejectedValue(new Error('Directory does not exist'));
            mockedFs.mkdir.mockResolvedValue(undefined);
            mockSharpInstance.toBuffer.mockRejectedValue(new Error('Processing failed'));

            // Act & Assert
            await expect(service.uploadImages(files, applicationId)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when file write fails', async () => {
            // Arrange
            const files = [mockFile];
            const applicationId = 1;

            jest.spyOn(require('uuid'), 'v4').mockReturnValue('uuid-generated-filename');

            mockedFs.access.mockRejectedValue(new Error('Directory does not exist'));
            mockedFs.mkdir.mockResolvedValue(undefined);
            mockedFs.writeFile.mockRejectedValue(new Error('Write failed'));

            // Act & Assert
            await expect(service.uploadImages(files, applicationId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getImagePath', () => {
        it('should return image path when file exists', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'test-image.jpg';
            const expectedPath = './uploads/applications/1/test-image.jpg';

            mockedFs.access.mockResolvedValue(undefined);

            // Act
            const result = await service.getImagePath(applicationId, filename);

            // Assert
            expect(result).toBe(expectedPath);
            expect(mockedFs.access).toHaveBeenCalledWith(expectedPath);
        });

        it('should throw BadRequestException when file does not exist', async () => {
            // Arrange
            const applicationId = 1;
            const filename = 'non-existent.jpg';

            mockedFs.access.mockRejectedValue(new Error('File not found'));

            // Act & Assert
            await expect(service.getImagePath(applicationId, filename)).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteApplicationImages', () => {
        it('should delete specified images successfully', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = ['image1.jpg', 'image2.png'];

            mockedFs.unlink.mockResolvedValue(undefined);
            mockedFs.readdir.mockResolvedValue([]);
            mockedFs.rmdir.mockResolvedValue(undefined);

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(mockedFs.unlink).toHaveBeenCalledTimes(2);
            expect(mockedFs.unlink).toHaveBeenCalledWith('./uploads/applications/1/image1.jpg');
            expect(mockedFs.unlink).toHaveBeenCalledWith('./uploads/applications/1/image2.png');
            expect(mockedFs.rmdir).toHaveBeenCalledWith('./uploads/applications/1');
        });

        it('should handle empty filenames array', async () => {
            // Arrange
            const applicationId = 1;
            const filenames: string[] = [];

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(mockedFs.unlink).not.toHaveBeenCalled();
        });

        it('should handle null filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = null as any;

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(mockedFs.unlink).not.toHaveBeenCalled();
        });

        it('should handle undefined filenames', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = undefined as any;

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(mockedFs.unlink).not.toHaveBeenCalled();
        });

        it('should not remove directory when other files exist', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = ['image1.jpg'];

            mockedFs.unlink.mockResolvedValue(undefined);
            mockedFs.readdir.mockResolvedValue(['other-file.txt']);

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(mockedFs.unlink).toHaveBeenCalledWith('./uploads/applications/1/image1.jpg');
            expect(mockedFs.rmdir).not.toHaveBeenCalled();
        });

        it('should handle file deletion errors gracefully', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = ['image1.jpg'];

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockedFs.unlink.mockRejectedValue(new Error('File not found'));
            mockedFs.readdir.mockResolvedValue([]);
            mockedFs.rmdir.mockResolvedValue(undefined);

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete image image1.jpg:', 'File not found');
            expect(mockedFs.rmdir).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle directory removal errors gracefully', async () => {
            // Arrange
            const applicationId = 1;
            const filenames = ['image1.jpg'];

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockedFs.unlink.mockResolvedValue(undefined);
            mockedFs.readdir.mockResolvedValue([]);
            mockedFs.rmdir.mockRejectedValue(new Error('Directory not empty'));

            // Act
            await service.deleteApplicationImages(applicationId, filenames);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Failed to remove application directory:', 'Directory not empty');

            consoleSpy.mockRestore();
        });
    });

    describe('deleteAllApplicationImages', () => {
        it('should delete all application images successfully', async () => {
            // Arrange
            const applicationId = 1;

            mockedFs.rm.mockResolvedValue(undefined);

            // Act
            await service.deleteAllApplicationImages(applicationId);

            // Assert
            expect(mockedFs.rm).toHaveBeenCalledWith('./uploads/applications/1', { recursive: true, force: true });
        });

        it('should handle deletion errors gracefully', async () => {
            // Arrange
            const applicationId = 1;

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockedFs.rm.mockRejectedValue(new Error('Directory not found'));

            // Act
            await service.deleteAllApplicationImages(applicationId);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete application images directory:', 'Directory not found');

            consoleSpy.mockRestore();
        });
    });

    describe('Configuration', () => {
        it('should use default upload path when not configured', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
                if (key === 'UPLOAD_PATH') return defaultValue;
                return defaultValue;
            });

            // Act
            const service = new ImageUploadService(configService);

            // Assert
            expect(mockConfigService.get).toHaveBeenCalledWith('UPLOAD_PATH', './uploads/applications');
        });

        it('should use default max file size when not configured', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
                if (key === 'MAX_FILE_SIZE') return defaultValue;
                return defaultValue;
            });

            // Act
            const service = new ImageUploadService(configService);

            // Assert
            expect(mockConfigService.get).toHaveBeenCalledWith('MAX_FILE_SIZE', 5 * 1024 * 1024);
        });

        it('should use configured values', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string) => {
                const config = {
                    UPLOAD_PATH: '/custom/uploads',
                    MAX_FILE_SIZE: 10 * 1024 * 1024,
                };
                return config[key];
            });

            // Act
            const service = new ImageUploadService(configService);

            // Assert
            expect(mockConfigService.get).toHaveBeenCalledWith('UPLOAD_PATH', './uploads/applications');
            expect(mockConfigService.get).toHaveBeenCalledWith('MAX_FILE_SIZE', 5 * 1024 * 1024);
        });
    });

    describe('File Validation', () => {
        it('should accept valid image types', async () => {
            // Arrange
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const applicationId = 1;

            jest.spyOn(require('uuid'), 'v4').mockReturnValue('uuid-generated-filename');
            mockedFs.access.mockRejectedValue(new Error('Directory does not exist'));
            mockedFs.mkdir.mockResolvedValue(undefined);
            mockedFs.writeFile.mockResolvedValue(undefined);

            for (const mimetype of validTypes) {
                const file = { ...mockFile, mimetype };
                const files = [file];

                // Act
                const result = await service.uploadImages(files, applicationId);

                // Assert
                expect(result).toHaveLength(1);
            }
        });

        it('should reject invalid image types', async () => {
            // Arrange
            const invalidTypes = ['text/plain', 'application/pdf', 'video/mp4', 'audio/mp3'];
            const applicationId = 1;

            for (const mimetype of invalidTypes) {
                const file = { ...mockFile, mimetype };
                const files = [file];

                // Act & Assert
                await expect(service.uploadImages(files, applicationId)).rejects.toThrow(BadRequestException);
            }
        });
    });
});
