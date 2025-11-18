import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { CreateApplicationDto } from "../dto/create-application.dto";
import { AlreadyExistsApplicationException } from "../exceptions/already-exists-application-exception";
import { ApplicationComponentsService } from "../application-components/application-components.service";

@Injectable()
export class CreateApplicationUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly applicationsService: ApplicationsService,
        private readonly applicationComponentsService: ApplicationComponentsService,
    ) { }

    async execute(username: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
        // Verify whether the Application name already exists for this user
        const exists = await this.applicationsService.existsByApplicationNameAndUsername(username, createApplicationDto.name);
        if (exists) throw new AlreadyExistsApplicationException();

        // Find the user
        const user = await this.usersService.findOneBy({ username });

        // Increment displayOrder of all existing applications for this user
        // New application will always be inserted at position 1
        await this.applicationsService.incrementDisplayOrderFrom(1, user.id);

        // Create the application with displayOrder = 1
        const application = await this.applicationsService.create({
            ...createApplicationDto,
            userId: user.id,
            displayOrder: 1,
        });

        /**
         * Create the components from application based on what was provided
         */
        await this.applicationComponentsService.saveComponents({
            user,
            application,
            dtos: {
                applicationComponentApi: createApplicationDto.applicationComponentApi,
                applicationComponentMobile: createApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: createApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: createApplicationDto.applicationComponentFrontend,
            },
        });

        /**
         * Associate technologies with the application
         */
        if (createApplicationDto.technologyIds) {
            await this.applicationsService.setApplicationTechnologies(
                application.id,
                createApplicationDto.technologyIds,
            );
        }

        return await this.applicationsService.findById(application.id, username);
    }
};
