import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
import { ApplicationTypeEnum } from "../../enums/application-type.enum";
import { ApplicationComponentApiDto } from "./application-component-api.dto";
import { ApplicationComponentMobileDto } from "./application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "./application-component-library.dto";
import { ApplicationComponentFrontendDto } from "./application-component-frontend.dto";
export declare class CreateComponentsForTypeDto {
    user: User;
    application: Application;
    dtos: ApplicationComponentsDto;
    applicationType?: ApplicationTypeEnum;
}
export declare class ApplicationComponentsDto {
    applicationComponentApi?: ApplicationComponentApiDto;
    applicationComponentMobile?: ApplicationComponentMobileDto;
    applicationComponentLibrary?: ApplicationComponentLibraryDto;
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
}
