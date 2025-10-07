import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { UpdateApplicationDto } from "../dto/update-application.dto";
import { ApplicationComponentsService } from "../application-components/application-components.service";

@Injectable()
export class UpdateApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,

        private readonly applicationComponentsService: ApplicationComponentsService,
    ) { }

    async execute(id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        // Update application
        const application = await this.applicationsService.update(id, updateApplicationDto);

        /**
         * Update the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: updateApplicationDto.type,
            dtos: {
                applicationComponentApi: updateApplicationDto.applicationComponentApi,
                applicationComponentMobile: updateApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: updateApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: updateApplicationDto.applicationComponentFrontend,
            },
        });

        return this.applicationsService.findById(id);
    }
};
