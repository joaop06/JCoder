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

    async execute(id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        // Verify if exists the application
        await this.applicationsService.findById(id);

        // Verify if alread exists the Application name
        await this.existsApplicationName(updateApplicationDto.name);

        // Update application
        const application = await this.applicationsService.update(id, updateApplicationDto);

        /**
         * Update the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: updateApplicationDto.applicationType,
            dtos: {
                applicationComponentApi: updateApplicationDto.applicationComponentApi,
                applicationComponentMobile: updateApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: updateApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: updateApplicationDto.applicationComponentFrontend,
            },
        });

        return await this.applicationsService.findById(id);
    }

    private async existsApplicationName(name: string): Promise<void> {
        if (!name) return;

        const exists = await this.applicationsService.existsApplicationName(name);
        if (exists) throw new AlreadyExistsApplicationException();
    }
};
