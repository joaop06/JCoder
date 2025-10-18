import { Injectable } from '@nestjs/common';
import { Application } from '../entities/application.entity';
import { ApplicationsService } from '../applications.service';
import { ApplicationNotFoundException } from '../exceptions/application-not-found.exception';

@Injectable()
export class UpdateProfileImageUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        // Check if application exists
        const application = await this.applicationsService.findById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Update the profile image (this will replace the existing one)
        return await this.applicationsService.updateProfileImage(id, file);
    }
}
