import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Generic use case for deleting a single image for any resource
 */
@Injectable()
export class DeleteResourceImageUseCase {
    constructor(private readonly imageStorageService: ImageStorageService) { }

    async execute(
        resourceType: ResourceType,
        resourceId: number | string,
        filename: string,
        subPath?: string,
    ): Promise<void> {
        await this.imageStorageService.deleteImage(
            resourceType,
            resourceId,
            filename,
            subPath,
        );
    }
}

