import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class GetImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    async execute(id: number, filename: string): Promise<string> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Get the image path
        return await this.imagesService.getImagePath(id, filename);
    }
}
