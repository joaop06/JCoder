import {
    UserComponentAboutMe,
    UserComponentEducation,
    UserComponentExperience,
    UserComponentCertificate,
    UserComponentReference,
} from "./user-components";
import {
    ApplicationComponentApi,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
} from "../applications/application-components";
import { Technology } from "../technologies/technology.entity";
import { Application } from "../applications/application.entity";

export interface User {
    id: number;
    username: string;
    firstName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    userComponentAboutMe?: UserComponentAboutMe;
    userComponentEducation?: UserComponentEducation[];
    userComponentExperience?: UserComponentExperience[];
    userComponentCertificate?: UserComponentCertificate[];
    userComponentReference?: UserComponentReference[];
    technologies?: Technology[];
    applications?: Application[];
    applicationsComponentsApis?: ApplicationComponentApi[];
    applicationsComponentsMobiles?: ApplicationComponentMobile[];
    applicationsComponentsLibraries?: ApplicationComponentLibrary[];
    applicationsComponentsFrontends?: ApplicationComponentFrontend[];
};
