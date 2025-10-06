import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { CreateApplicationDto } from "../dto/create-application.dto";
import { RequiredApiComponentToApiApplication } from "../exceptions/required-api-component.exception";
import { ApplicationComponentsRepository } from "../application-components/application-componets.reposiotry";
import { ApplicationComponentApi } from "../application-components/entities/application-component-api.entity";
import { RequiredMobileComponentToMobileApplication } from "../exceptions/required-mobile-component.exception";
import { RequiredLibraryComponentToLibraryApplication } from "../exceptions/required-library-component.exception";
import { ApplicationComponentMobile } from "../application-components/entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "../application-components/entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "../application-components/entities/application-component-frontend.entity";
import { RequiredApiAndFrontendComponentsToFullstackApplication } from "../exceptions/required-api-and-frontend-components.exception";

@Injectable()
export class CreateApplicationUseCase {
    constructor(
        private readonly usersService: UsersService,

        private readonly applicationsService: ApplicationsService,

        private readonly applicationComponentsRepository: ApplicationComponentsRepository,
    ) { }

    async execute(createApplicationDto: CreateApplicationDto): Promise<Application> {
        // Check if the user exists
        await this.usersService.findById(createApplicationDto.userId);

        // Validate whether components are present based on type
        this.validateDetailsForType(createApplicationDto);

        // Create the application with the respective components
        return await this.applicationsService.create({
            ...createApplicationDto,
            ...this.createComponentsForType(createApplicationDto),
        });
    }

    private validateDetailsForType(dto: CreateApplicationDto): void {
        switch (dto.type) {
            case ApplicationTypeEnum.API:
                if (!dto.applicationComponentApi) {
                    throw new RequiredApiComponentToApiApplication();
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

    private createComponentsForType(dto: CreateApplicationDto): {
        applicationComponentApi?: ApplicationComponentApi;
        applicationComponentMobile?: ApplicationComponentMobile;
        applicationComponentLibrary?: ApplicationComponentLibrary;
        applicationComponentFrontend?: ApplicationComponentFrontend;
    } {
        switch (dto.type) {
            case ApplicationTypeEnum.API:
                return {
                    applicationComponentApi: this.applicationComponentsRepository.createApi({
                        ...dto.applicationComponentApi,
                    })
                };

            case ApplicationTypeEnum.FULLSTACK:
                return {
                    applicationComponentApi: this.applicationComponentsRepository.createApi({
                        ...dto.applicationComponentApi,
                    }),
                    applicationComponentFrontend: this.applicationComponentsRepository.createFrontend({
                        ...dto.applicationComponentFrontend,
                    }),
                };

            case ApplicationTypeEnum.MOBILE:
                return {
                    applicationComponentMobile: this.applicationComponentsRepository.createMobile({
                        ...dto.applicationComponentMobile,
                    }),
                };

            case ApplicationTypeEnum.LIBRARY:
                return {
                    applicationComponentLibrary: this.applicationComponentsRepository.createLibrary({
                        ...dto.applicationComponentLibrary,
                    }),
                };
        }
    }
};
