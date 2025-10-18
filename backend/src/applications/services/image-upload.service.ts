import sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageUploadService {
    private readonly uploadPath: string;
    private readonly maxFileSize: number;
    private readonly allowedMimeTypes: string[];

    constructor(private readonly configService: ConfigService) {
        this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads/applications');
        this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
        this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    async uploadImages(files: Express.Multer.File[], applicationId: number): Promise<string[]> {
        if (!files || files.length === 0) {
            return [];
        }

        // Validate files
        this.validateFiles(files);

        // Ensure upload directory exists
        await this.ensureUploadDirectory(applicationId);

        const uploadedFilenames: string[] = [];

        for (const file of files) {
            const filename = await this.processAndSaveImage(file, applicationId);
            uploadedFilenames.push(filename);
        }

        return uploadedFilenames;
    }

    private validateFiles(files: Express.Multer.File[]): void {
        for (const file of files) {
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException(
                    `Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
                );
            }

            if (file.size > this.maxFileSize) {
                throw new BadRequestException(
                    `File too large: ${file.size} bytes. Maximum size: ${this.maxFileSize} bytes`
                );
            }
        }
    }

    private async processAndSaveImage(file: Express.Multer.File, applicationId: number): Promise<string> {
        // Always save as JPEG with .jpg extension for consistency
        const filename = `${uuidv4()}.jpg`;
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);

        try {
            // Process image with Sharp for compression and optimization
            const processedImageBuffer = await sharp(file.buffer)
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 85,
                    progressive: true
                })
                .toBuffer();

            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new BadRequestException(`Failed to process image: ${errorMessage}`);
        }
    }

    private async ensureUploadDirectory(applicationId: number): Promise<void> {
        const applicationDir = path.join(this.uploadPath, applicationId.toString());

        try {
            await fs.access(applicationDir);
        } catch {
            await fs.mkdir(applicationDir, { recursive: true });
        }
    }

    async getImagePath(applicationId: number, filename: string): Promise<string> {
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);

        try {
            await fs.access(filePath);
            return filePath;
        } catch {
            throw new BadRequestException(`Image not found: ${filename}`);
        }
    }

    async deleteApplicationImages(applicationId: number, filenames: string[]): Promise<void> {
        if (!filenames || filenames.length === 0) {
            return;
        }

        const applicationDir = path.join(this.uploadPath, applicationId.toString());

        for (const filename of filenames) {
            const filePath = path.join(applicationDir, filename);

            try {
                await fs.unlink(filePath);
            } catch (error) {
                // Log error but don't throw - file might already be deleted
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to delete image ${filename}:`, errorMessage);
            }
        }

        // Try to remove the application directory if it's empty
        try {
            const files = await fs.readdir(applicationDir);
            if (files.length === 0) {
                await fs.rmdir(applicationDir);
            }
        } catch (error) {
            // Directory might not exist or might not be empty
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`Failed to remove application directory:`, errorMessage);
        }
    }

    async deleteAllApplicationImages(applicationId: number): Promise<void> {
        const applicationDir = path.join(this.uploadPath, applicationId.toString());

        try {
            await fs.rm(applicationDir, { recursive: true, force: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`Failed to delete application images directory:`, errorMessage);
        }
    }

    async uploadProfileImage(file: Express.Multer.File, applicationId: number): Promise<string> {
        // Validate file
        this.validateFiles([file]);

        // Ensure upload directory exists
        await this.ensureUploadDirectory(applicationId);

        // Process and save profile image with specific naming
        const filename = `profile-${uuidv4()}.jpg`;
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);

        try {
            // Process image with Sharp for compression and optimization
            // Profile images should be smaller and square
            const processedImageBuffer = await sharp(file.buffer)
                .resize(400, 400, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({
                    quality: 90,
                    progressive: true
                })
                .toBuffer();

            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new BadRequestException(`Failed to process profile image: ${errorMessage}`);
        }
    }

    async getProfileImagePath(applicationId: number, filename: string): Promise<string> {
        // Use the same method as regular images since they're stored in the same directory
        return await this.getImagePath(applicationId, filename);
    }
}
