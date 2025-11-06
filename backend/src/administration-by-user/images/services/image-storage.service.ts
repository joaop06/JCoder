import sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import { Injectable, BadRequestException } from '@nestjs/common';
import {
    ImageProcessingConfig,
    DEFAULT_IMAGE_CONFIGS,
    ResourceImageConfig,
} from '../types/image-config.interface';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

/**
 * Generic image storage service that handles image upload, processing, and deletion
 * for any resource type (applications, technologies, users, etc.)
 */
@Injectable()
export class ImageStorageService {
    private readonly uploadBasePath: string;
    private readonly resourceConfigs: Map<string, ResourceImageConfig>;

    constructor() {
        // Usar path absoluto baseado em process.cwd() para garantir que funcione em qualquer ambiente
        // O storage sempre está em src/administration-by-user/images/storage, mesmo quando o código está compilado em dist/
        this.uploadBasePath = path.resolve(process.cwd(), 'src', 'administration-by-user', 'images', 'storage');
        this.resourceConfigs = new Map(Object.entries(DEFAULT_IMAGE_CONFIGS));
    }

    /**
     * Upload a single image for a specific resource
     */
    async uploadImage(
        file: Express.Multer.File,
        resourceType: ResourceType,
        resourceId: number | string,
        imageType: ImageType,
        subPath?: string,
        username?: string,
    ): Promise<string> {
        const config = this.getImageConfig(resourceType, imageType);
        this.validateFile(file, config);

        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        await this.ensureDirectory(dirPath);

        const filename = await this.processAndSaveImage(file, dirPath, imageType, config);
        return filename;
    }

    /**
     * Upload multiple images for a specific resource
     */
    async uploadImages(
        files: Express.Multer.File[],
        resourceType: ResourceType,
        resourceId: number | string,
        imageType: ImageType,
        subPath?: string,
        username?: string,
    ): Promise<string[]> {
        if (!files || files.length === 0) {
            return [];
        }

        const config = this.getImageConfig(resourceType, imageType);
        files.forEach(file => this.validateFile(file, config));

        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        await this.ensureDirectory(dirPath);

        const uploadPromises = files.map(file =>
            this.processAndSaveImage(file, dirPath, imageType, config)
        );

        return await Promise.all(uploadPromises);
    }

    /**
     * Get the full path to an image file
     */
    async getImagePath(
        resourceType: ResourceType,
        resourceId: number | string,
        filename: string,
        subPath?: string,
        username?: string,
    ): Promise<string> {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        const filePath = path.join(dirPath, filename);

        try {
            await fs.access(filePath);
            return filePath;
        } catch {
            throw new BadRequestException(`Image not found: ${filename}`);
        }
    }

    /**
     * Delete a single image
     */
    async deleteImage(
        resourceType: ResourceType,
        resourceId: number | string,
        filename: string,
        subPath?: string,
        username?: string,
    ): Promise<void> {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        const filePath = path.join(dirPath, filename);

        try {
            await fs.unlink(filePath);
        } catch (error) {
            // File might already be deleted, ignore error
        }
    }

    /**
     * Delete multiple images
     */
    async deleteImages(
        resourceType: ResourceType,
        resourceId: number | string,
        filenames: string[],
        subPath?: string,
        username?: string,
    ): Promise<void> {
        if (!filenames || filenames.length === 0) {
            return;
        }

        const deletePromises = filenames.map(filename =>
            this.deleteImage(resourceType, resourceId, filename, subPath, username)
        );

        await Promise.all(deletePromises);

        // Try to remove the directory if it's empty
        await this.cleanupEmptyDirectory(resourceType, resourceId, subPath, username);
    }

    /**
     * Delete all images for a specific resource
     */
    async deleteAllResourceImages(
        resourceType: ResourceType,
        resourceId: number | string,
        username?: string,
    ): Promise<void> {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, undefined, username);

        try {
            await fs.rm(dirPath, { recursive: true, force: true });
        } catch (error) {
            // Directory might not exist, ignore error
        }
    }

    /**
     * Check if an image exists
     */
    async imageExists(
        resourceType: ResourceType,
        resourceId: number | string,
        filename: string,
        subPath?: string,
        username?: string,
    ): Promise<boolean> {
        try {
            await this.getImagePath(resourceType, resourceId, filename, subPath, username);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Process and save image with the specified configuration
     */
    private async processAndSaveImage(
        file: Express.Multer.File,
        dirPath: string,
        imageType: ImageType,
        config: ImageProcessingConfig,
    ): Promise<string> {
        const extension = this.getOutputExtension(config.outputFormat, file.mimetype);
        const filename = `${imageType}-${uuidv4()}${extension}`;
        const filePath = path.join(dirPath, filename);

        try {
            let sharpInstance = sharp(file.buffer);

            // Resize
            sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
                fit: config.fit,
                position: config.position,
                withoutEnlargement: config.fit === 'inside',
            });

            // Convert to output format
            const processedImageBuffer = await this.convertToFormat(
                sharpInstance,
                config.outputFormat || 'jpeg',
                file.mimetype,
                config.quality,
                config.progressive,
            );

            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new BadRequestException(`Failed to process image: ${errorMessage}`);
        }
    }

    /**
     * Convert sharp instance to the specified format
     */
    private async convertToFormat(
        sharpInstance: sharp.Sharp,
        format: string,
        originalMimeType: string,
        quality: number,
        progressive: boolean,
    ): Promise<Buffer> {
        // SVG files should not be processed with sharp
        if (originalMimeType === 'image/svg+xml') {
            return await sharpInstance.toBuffer();
        }

        switch (format) {
            case 'jpeg':
                return await sharpInstance
                    .jpeg({ quality, progressive })
                    .toBuffer();
            case 'png':
                return await sharpInstance
                    .png({ quality, progressive })
                    .toBuffer();
            case 'webp':
                return await sharpInstance
                    .webp({ quality })
                    .toBuffer();
            case 'original':
                return await sharpInstance.toBuffer();
            default:
                return await sharpInstance
                    .jpeg({ quality, progressive })
                    .toBuffer();
        }
    }

    /**
     * Get output file extension based on format
     */
    private getOutputExtension(format: string | undefined, mimeType: string): string {
        if (mimeType === 'image/svg+xml') {
            return '.svg';
        }

        switch (format) {
            case 'jpeg':
                return '.jpg';
            case 'png':
                return '.png';
            case 'webp':
                return '.webp';
            case 'original':
                return this.getExtensionFromMimeType(mimeType);
            default:
                return '.jpg';
        }
    }

    /**
     * Get file extension from MIME type
     */
    private getExtensionFromMimeType(mimeType: string): string {
        const mimeToExt: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
        };
        return mimeToExt[mimeType] || '.jpg';
    }

    /**
     * Validate file against configuration
     */
    private validateFile(file: Express.Multer.File, config: ImageProcessingConfig): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!config.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type: ${file.mimetype}. Allowed types: ${config.allowedMimeTypes.join(', ')}`
            );
        }

        if (file.size > config.maxFileSize) {
            const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(2);
            throw new BadRequestException(
                `File too large: ${file.size} bytes. Maximum size: ${maxSizeMB}MB`
            );
        }
    }

    /**
     * Get image configuration for resource and image type
     */
    private getImageConfig(resourceType: ResourceType, imageType: ImageType): ImageProcessingConfig {
        const resourceConfig = this.resourceConfigs.get(resourceType);

        if (!resourceConfig) {
            throw new BadRequestException(`No configuration found for resource type: ${resourceType}`);
        }

        const imageConfig = resourceConfig[imageType];

        if (!imageConfig) {
            throw new BadRequestException(
                `No configuration found for image type: ${imageType} in resource: ${resourceType}`
            );
        }

        return imageConfig;
    }

    /**
     * Build directory path for resource images
     * Structure: {basePath}/{username}/{resourceType}/{resourceId}/{subPath}
     * If username is not provided, it will be omitted (for global resources like technologies)
     */
    private buildDirectoryPath(
        resourceType: ResourceType,
        resourceId: number | string,
        subPath?: string,
        username?: string,
    ): string {
        const parts = [this.uploadBasePath];

        // Add username if provided (for user-specific resources)
        if (username) {
            parts.push(username);
        }

        parts.push(resourceType, resourceId.toString());

        if (subPath) {
            parts.push(subPath);
        }

        return path.join(...parts);
    }

    /**
     * Ensure directory exists
     */
    private async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Clean up empty directory
     */
    private async cleanupEmptyDirectory(
        resourceType: ResourceType,
        resourceId: number | string,
        subPath?: string,
        username?: string,
    ): Promise<void> {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);

        try {
            const files = await fs.readdir(dirPath);
            if (files.length === 0) {
                await fs.rmdir(dirPath);
            }
        } catch (error) {
            // Directory might not exist or might not be empty, ignore error
        }
    }

    /**
     * Register custom configuration for a resource type
     */
    registerResourceConfig(resourceType: string, config: ResourceImageConfig): void {
        this.resourceConfigs.set(resourceType, config);
    }
}

