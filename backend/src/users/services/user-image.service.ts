import sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UserImageService {
    private readonly uploadPath: string;
    private readonly maxFileSize: number;
    private readonly allowedMimeTypes: string[];

    constructor(private readonly configService: ConfigService) {
        this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        this.uploadPath = this.configService.get<string>('USER_UPLOAD_PATH', './uploads/users');
        this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
    }

    async uploadProfileImage(file: Express.Multer.File, userId: number): Promise<string> {
        // Validate file
        this.validateFile(file);

        // Ensure upload directory exists
        await this.ensureUploadDirectory(userId);

        // Process and save profile image with specific naming
        const filename = `profile-${uuidv4()}.jpg`;
        const filePath = path.join(this.uploadPath, userId.toString(), filename);

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

    async uploadComponentImage(file: Express.Multer.File, userId: number, componentType: string): Promise<string> {
        // Validate file
        this.validateFile(file);

        // Ensure upload directory exists
        await this.ensureUploadDirectory(userId, componentType);

        // Process and save component image
        const filename = `${componentType}-${uuidv4()}.jpg`;
        const filePath = path.join(this.uploadPath, userId.toString(), componentType, filename);

        try {
            // Process image with Sharp for compression and optimization
            const processedImageBuffer = await sharp(file.buffer)
                .resize(800, 600, {
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
            throw new BadRequestException(`Failed to process component image: ${errorMessage}`);
        }
    }

    async getImagePath(userId: number, filename: string, componentType?: string): Promise<string> {
        const imagePath = componentType
            ? path.join(this.uploadPath, userId.toString(), componentType, filename)
            : path.join(this.uploadPath, userId.toString(), filename);

        try {
            await fs.access(imagePath);
            return imagePath;
        } catch {
            throw new BadRequestException('Image not found');
        }
    }

    async deleteImage(userId: number, filename: string, componentType?: string): Promise<void> {
        const imagePath = componentType
            ? path.join(this.uploadPath, userId.toString(), componentType, filename)
            : path.join(this.uploadPath, userId.toString(), filename);

        try {
            await fs.unlink(imagePath);
        } catch (error) {
            // Ignore if file doesn't exist
        }
    }

    async deleteAllUserImages(userId: number): Promise<void> {
        const userDir = path.join(this.uploadPath, userId.toString());
        try {
            await fs.rm(userDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore if directory doesn't exist
        }
    }

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
    }

    private async ensureUploadDirectory(userId: number, componentType?: string): Promise<void> {
        const dirPath = componentType
            ? path.join(this.uploadPath, userId.toString(), componentType)
            : path.join(this.uploadPath, userId.toString());

        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            throw new BadRequestException('Failed to create upload directory');
        }
    }
}
