import {
    ApplicationComponentApi,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
} from "../application-components";
import { ApplicationTypeEnum } from "@/types";

export interface UpdateApplicationDto {
    name?: string;

    description?: string;

    applicationType?: ApplicationTypeEnum;

    githubUrl?: string;

    isActive?: boolean;

    applicationComponentApi?: ApplicationComponentApi;

    applicationComponentMobile?: ApplicationComponentMobile;

    applicationComponentLibrary?: ApplicationComponentLibrary;

    applicationComponentFrontend?: ApplicationComponentFrontend;

    technologyIds?: number[];
};
