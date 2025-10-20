import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class DeleteImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    async execute(id: number, filename: string): Promise<void> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Delete the image
        await this.imagesService.deleteImage(id, filename);
    }
}
