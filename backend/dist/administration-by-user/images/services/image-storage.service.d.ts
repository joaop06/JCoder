import { ResourceImageConfig } from '../types/image-config.interface';
import { ImageType } from '../enums/image-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
export declare class ImageStorageService {
    private readonly uploadBasePath;
    private readonly resourceConfigs;
    constructor();
    uploadImage(file: Express.Multer.File, resourceType: ResourceType, resourceId: number | string, imageType: ImageType, subPath?: string, username?: string): Promise<string>;
    uploadImages(files: Express.Multer.File[], resourceType: ResourceType, resourceId: number | string, imageType: ImageType, subPath?: string, username?: string): Promise<string[]>;
    getImagePath(resourceType: ResourceType, resourceId: number | string, filename: string, subPath?: string, username?: string): Promise<string>;
    deleteImage(resourceType: ResourceType, resourceId: number | string, filename: string, subPath?: string, username?: string): Promise<void>;
    deleteImages(resourceType: ResourceType, resourceId: number | string, filenames: string[], subPath?: string, username?: string): Promise<void>;
    deleteAllResourceImages(resourceType: ResourceType, resourceId: number | string, username?: string): Promise<void>;
    imageExists(resourceType: ResourceType, resourceId: number | string, filename: string, subPath?: string, username?: string): Promise<boolean>;
    private processAndSaveImage;
    private convertToFormat;
    private getOutputExtension;
    private getExtensionFromMimeType;
    private validateFile;
    private getImageConfig;
    private buildDirectoryPath;
    private ensureDirectory;
    private cleanupEmptyDirectory;
    registerResourceConfig(resourceType: string, config: ResourceImageConfig): void;
}
