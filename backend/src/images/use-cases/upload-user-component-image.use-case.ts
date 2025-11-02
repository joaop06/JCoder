import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

/**
 * Use case for uploading component images for users
 * (e.g., certificate images, project images, etc.)
 */
@Injectable()
export class UploadUserComponentImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(
        userId: number,
        file: Express.Multer.File,
        componentType: string,
    ): Promise<string> {
        return await this.imageStorageService.uploadImage(
            file,
            ResourceType.User,
            userId,
            ImageType.Component,
            componentType,
        );
    }
}

