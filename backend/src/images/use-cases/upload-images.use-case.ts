import { Injectable } from '@nestjs/common';
import { Application } from '../../applications/entities/application.entity';
import { ImagesService } from '../images.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class UploadImagesUseCase {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<Application> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Upload the images
        return await this.imagesService.uploadImages(id, files);
    }
}
