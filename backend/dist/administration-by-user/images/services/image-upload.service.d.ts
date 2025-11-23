import { ConfigService } from '@nestjs/config';
export declare class ImageUploadService {
    private readonly configService;
    private static readonly STORAGE_BASE_PATH;
    private static readonly APPLICATIONS_PATH;
    private readonly uploadPath;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(configService: ConfigService);
    uploadImages(files: Express.Multer.File[], applicationId: number): Promise<string[]>;
    private validateFiles;
    private processAndSaveImage;
    private ensureUploadDirectory;
    getImagePath(applicationId: number, filename: string): Promise<string>;
    deleteApplicationImages(applicationId: number, filenames: string[]): Promise<void>;
    deleteAllApplicationImages(applicationId: number): Promise<void>;
    uploadProfileImage(file: Express.Multer.File, applicationId: number): Promise<string>;
    getProfileImagePath(applicationId: number, filename: string): Promise<string>;
    uploadFile(file: Express.Multer.File, entityFolder: string, prefix?: string): Promise<string>;
    deleteFile(entityFolder: string, filename: string): Promise<void>;
    getFilePath(entityFolder: string, filename: string): Promise<string>;
}
