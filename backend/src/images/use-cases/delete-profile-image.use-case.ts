import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class DeleteProfileImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    async execute(id: number): Promise<void> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Delete the profile image
        await this.imagesService.deleteProfileImage(id);
    }
}
