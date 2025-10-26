import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { ApplicationComponentApi } from "./application-component-api.entity";
import { ApplicationComponentMobile } from "./application-component-mobile.entity";
import { ApplicationComponentLibrary } from "./application-component-library.entity";
import { ApplicationComponentFrontend } from "./application-component-frontend.entity";

export interface Application {
    id: number;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    applicationComponentApi?: ApplicationComponentApi | null;
    applicationComponentMobile?: ApplicationComponentMobile | null;
    applicationComponentLibrary?: ApplicationComponentLibrary | null;
    applicationComponentFrontend?: ApplicationComponentFrontend | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
