import { Injectable } from '@nestjs/common';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Use case for getting component image path for users
 */
@Injectable()
export class GetUserComponentImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(
        userId: number,
        filename: string,
        componentType: string,
    ): Promise<string> {
        return await this.imageStorageService.getImagePath(
            ResourceType.User,
            userId,
            filename,
            componentType,
        );
    }
}

