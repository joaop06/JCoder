import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Use case for deleting component images for users
 */
@Injectable()
export class DeleteUserComponentImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(
        userId: number,
        filename: string,
        componentType: string,
    ): Promise<void> {
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            userId,
            filename,
            componentType,
        );
    }
}

