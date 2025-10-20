import { Injectable } from '@nestjs/common';
import { Application } from '../../applications/entities/application.entity';
import { ImagesService } from '../images.service';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class UpdateProfileImageUseCase {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        // Check if application exists
        const application = await this.imagesService.findApplicationById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Update the profile image (this will replace the existing one)
        return await this.imagesService.updateProfileImage(id, file);
    }
}
