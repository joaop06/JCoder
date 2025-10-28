import { ApplicationTypeEnum } from "@/types/enums/application-type.enum";
import { ApplicationComponentApiDto } from "./application-component-api.dto";
import { ApplicationComponentMobileDto } from "./application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "./application-component-library.dto";
import { ApplicationComponentFrontendDto } from "./application-component-frontend.dto";

export interface UpdateApplicationDto {
    name?: string;
    githubUrl?: string;
    description?: string;
    applicationType?: ApplicationTypeEnum;
    isActive?: boolean;
    technologyIds?: number[];
    applicationComponentApi?: ApplicationComponentApiDto;
    applicationComponentMobile?: ApplicationComponentMobileDto;
    applicationComponentLibrary?: ApplicationComponentLibraryDto;
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
};
