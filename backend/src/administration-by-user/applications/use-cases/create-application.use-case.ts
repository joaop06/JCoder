import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { CreateApplicationDto } from "../dto/create-application.dto";
import { RequiredApiComponentToApiApplication } from "../exceptions/required-api-component.exception";
import { AlreadyExistsApplicationException } from "../exceptions/already-exists-application-exception";
import { ApplicationComponentsService } from "../application-components/application-components.service";
import { RequiredMobileComponentToMobileApplication } from "../exceptions/required-mobile-component.exception";
import { RequiredFrontendComponentToApiApplication } from "../exceptions/required-frontend-component.exception";
import { RequiredLibraryComponentToLibraryApplication } from "../exceptions/required-library-component.exception";
import { RequiredApiAndFrontendComponentsToFullstackApplication } from "../exceptions/required-api-and-frontend-components.exception";

@Injectable()
export class CreateApplicationUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly applicationsService: ApplicationsService,
        private readonly applicationComponentsService: ApplicationComponentsService,
    ) { }

    async execute(username: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
        // Validate whether components are present based on type
        this.validateDetailsForType(createApplicationDto);

        // Verify if already exists the Application name for this user
        const exists = await this.applicationsService.existsByApplicationNameAndUsername(username, createApplicationDto.name);
        if (exists) throw new AlreadyExistsApplicationException();

        // Increment displayOrder of all existing applications for this user
        // New application will always be inserted at position 1
        await this.applicationsService.incrementDisplayOrderFrom(1, username);

        // Create the application with displayOrder = 1
        const applicationData = {
            ...createApplicationDto,
            username,
            displayOrder: 1,
        };

        // Create the application with the respective components
        const application = await this.applicationsService.create(applicationData);

        const user = await this.usersService.findOneBy({ username });

        /**
         * Create the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            user,
            application,
            applicationType: createApplicationDto.applicationType,
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

    private validateDetailsForType(dto: CreateApplicationDto): void {
        switch (dto.applicationType) {
            case ApplicationTypeEnum.API:
                if (!dto.applicationComponentApi) {
                    throw new RequiredApiComponentToApiApplication();
                }
                break;
            case ApplicationTypeEnum.FRONTEND:
                if (!dto.applicationComponentApi) {
                    throw new RequiredFrontendComponentToApiApplication();
                }
                break;

            case ApplicationTypeEnum.FULLSTACK:
                if (!dto.applicationComponentApi || !dto.applicationComponentFrontend) {
                    throw new RequiredApiAndFrontendComponentsToFullstackApplication();
                }
                break;

            case ApplicationTypeEnum.MOBILE:
                if (!dto.applicationComponentMobile) {
                    throw new RequiredMobileComponentToMobileApplication();
                }
                break;

            case ApplicationTypeEnum.LIBRARY:
                if (!dto.applicationComponentLibrary) {
                    throw new RequiredLibraryComponentToLibraryApplication();
                }
                break;
        }
    }
};
