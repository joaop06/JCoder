import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { UpdateApplicationDto } from "../dto/update-application.dto";
import { AlreadyExistsApplicationException } from "../exceptions/already-exists-application-exception";
import { ApplicationComponentsService } from "../application-components/application-components.service";

@Injectable()
export class UpdateApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly applicationComponentsService: ApplicationComponentsService,
    ) { }

    async execute(username: string, id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        // Verify whether the application exists for this user
        const application = await this.applicationsService.findById(id, username);

        // Verify whether the Application name already exists for this user
        await this.existsApplicationName(username, id, updateApplicationDto.name);

        // Update application
        const updatedApplication = await this.applicationsService.update(id, updateApplicationDto);

        /**
         * Update the components from application based on what was provided
         * Only components explicitly provided will be updated/created
         */
        await this.applicationComponentsService.updateComponents({
            user: application.user,
            application: updatedApplication,
            dtos: {
                applicationComponentApi: updateApplicationDto.applicationComponentApi,
                applicationComponentMobile: updateApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: updateApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: updateApplicationDto.applicationComponentFrontend,
            },
        });

        /**
         * Update technologies associated with the application
         */
        if (updateApplicationDto.technologyIds !== undefined) {
            await this.applicationsService.setApplicationTechnologies(
                id,
                updateApplicationDto.technologyIds,
            );
        }

        return await this.applicationsService.findById(id, username);
    }

    private async existsApplicationName(username: string, id: number, name: string): Promise<void> {
        if (!name) return;

        const exists = await this.applicationsService.existsByApplicationNameAndUsername(username, name);
        if (exists && exists.id !== id) throw new AlreadyExistsApplicationException();
    }
};
