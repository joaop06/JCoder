import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Generic use case for deleting multiple images for any resource
 */
@Injectable()
export class DeleteResourceImagesUseCase {
    constructor(private readonly imageStorageService: ImageStorageService) { }

    async execute(
        resourceType: ResourceType,
        resourceId: number | string,
        filenames: string[],
        subPath?: string,
    ): Promise<void> {
        await this.imageStorageService.deleteImages(
            resourceType,
            resourceId,
            filenames,
            subPath,
        );
    }
}

