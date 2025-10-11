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

    async execute(createApplicationDto: CreateApplicationDto): Promise<Application> {
        // Check if the user exists
        await this.usersService.findById(createApplicationDto.userId);

        // Validate whether components are present based on type
        this.validateDetailsForType(createApplicationDto);

        // Verify if alread exists the Application name
        const exists = await this.applicationsService.existsApplicationName(createApplicationDto.name);
        if (exists) throw new AlreadyExistsApplicationException();

        // Create the application with the respective components
        const application = await this.applicationsService.create(createApplicationDto);

        /**
         * Create the components from application
         */
        await this.applicationComponentsService.saveComponentsForType({
            application,
            applicationType: createApplicationDto.applicationType,
            dtos: {
                applicationComponentApi: createApplicationDto.applicationComponentApi,
                applicationComponentMobile: createApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: createApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: createApplicationDto.applicationComponentFrontend,
            },
        });

        return await this.applicationsService.findById(application.id);
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
