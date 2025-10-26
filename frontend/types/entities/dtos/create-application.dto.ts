import { ApplicationTypeEnum } from "@/types/enums/application-type.enum";
import { ApplicationComponentApiDto } from "./application-component-api.dto";
import { ApplicationComponentMobileDto } from "./application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "./application-component-library.dto";
import { ApplicationComponentFrontendDto } from "./application-component-frontend.dto";

export interface CreateApplicationDto {
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    applicationComponentApi?: ApplicationComponentApiDto;
    applicationComponentMobile?: ApplicationComponentMobileDto;
    applicationComponentLibrary?: ApplicationComponentLibraryDto;
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
};
