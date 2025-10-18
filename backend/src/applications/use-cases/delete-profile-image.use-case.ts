import { Injectable } from '@nestjs/common';
import { ApplicationsService } from '../applications.service';
import { ApplicationNotFoundException } from '../exceptions/application-not-found.exception';

@Injectable()
export class DeleteProfileImageUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: number): Promise<void> {
        // Check if application exists
        const application = await this.applicationsService.findById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Delete the profile image
        await this.applicationsService.deleteProfileImage(id);
    }
}
