import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Generic use case for getting an image path for any resource
 */
@Injectable()
export class GetResourceImageUseCase {
    constructor(private readonly imageStorageService: ImageStorageService) { }

    async execute(
        resourceType: ResourceType,
        resourceId: number | string,
        filename: string,
        subPath?: string,
    ): Promise<string> {
        return await this.imageStorageService.getImagePath(
            resourceType,
            resourceId,
            filename,
            subPath,
        );
    }
}

