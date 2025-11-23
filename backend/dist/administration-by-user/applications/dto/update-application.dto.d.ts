import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { ApplicationComponentApiDto } from "../application-components/dto/application-component-api.dto";
import { ApplicationComponentMobileDto } from "../application-components/dto/application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "../application-components/dto/application-component-library.dto";
import { ApplicationComponentFrontendDto } from "../application-components/dto/application-component-frontend.dto";
export declare class UpdateApplicationDto {
    name?: string;
    description?: string;
    applicationType?: ApplicationTypeEnum;
    githubUrl?: string;
    isActive?: boolean;
    applicationComponentApi?: ApplicationComponentApiDto;
    applicationComponentMobile?: ApplicationComponentMobileDto;
    applicationComponentLibrary?: ApplicationComponentLibraryDto;
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
    technologyIds?: number[];
}
