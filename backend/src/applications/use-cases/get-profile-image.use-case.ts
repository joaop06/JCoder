import { Injectable } from '@nestjs/common';
import { ApplicationsService } from '../applications.service';
import { ApplicationNotFoundException } from '../exceptions/application-not-found.exception';

@Injectable()
export class GetProfileImageUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: number): Promise<string> {
        // Check if application exists
        const application = await this.applicationsService.findById(id);
        if (!application) throw new ApplicationNotFoundException();

        // Get the profile image path
        return await this.applicationsService.getProfileImagePath(id);
    }
}
