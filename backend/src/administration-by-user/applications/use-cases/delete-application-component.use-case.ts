import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { ApplicationComponentsService } from "../application-components/application-components.service";

@Injectable()
export class DeleteApplicationComponentUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly applicationComponentsService: ApplicationComponentsService,
    ) { }

    async execute(
        username: string,
        applicationId: number,
        componentType: 'api' | 'mobile' | 'library' | 'frontend',
    ): Promise<Application> {
        // Verify whether the application exists for this user
        await this.applicationsService.findById(applicationId, username);

        // Delete the component
        await this.applicationComponentsService.deleteComponent(applicationId, componentType);

        // Return the updated application
        return await this.applicationsService.findById(applicationId, username);
    }
};
