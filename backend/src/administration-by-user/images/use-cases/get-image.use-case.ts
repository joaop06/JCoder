import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class GetImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(id: number, filename: string): Promise<string> {
        const application = await this.imagesService.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.Application,
            id,
            filename,
            undefined,
            application.user.username,
        );
    }
};
