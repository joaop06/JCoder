import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

/**
 * Generic use case for uploading multiple images for any resource
 */
@Injectable()
export class UploadResourceImagesUseCase {
    constructor(private readonly imageStorageService: ImageStorageService) { }

    async execute(
        files: Express.Multer.File[],
        resourceType: ResourceType,
        resourceId: number | string,
        imageType: ImageType,
        subPath?: string,
    ): Promise<string[]> {
        return await this.imageStorageService.uploadImages(
            files,
            resourceType,
            resourceId,
            imageType,
            subPath,
        );
    }
}

