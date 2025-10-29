import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

/**
 * Generic use case for uploading a single image for any resource
 */
@Injectable()
export class UploadResourceImageUseCase {
    constructor(private readonly imageStorageService: ImageStorageService) { }

    async execute(
        file: Express.Multer.File,
        resourceType: ResourceType,
        resourceId: number | string,
        imageType: ImageType,
        subPath?: string,
    ): Promise<string> {
        return await this.imageStorageService.uploadImage(
            file,
            resourceType,
            resourceId,
            imageType,
            subPath,
        );
    }
}

