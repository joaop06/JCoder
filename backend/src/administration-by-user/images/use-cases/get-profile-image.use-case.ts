import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class GetProfileImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(id: number): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.Application,
            id,
            application.profileImage,
            undefined,
            application.user.username,
        );
    }
};
