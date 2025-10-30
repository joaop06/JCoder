import { RoleEnum } from "../enums/role.enum";
import { Application } from "./application.entity";
import { UserComponentAboutMe } from "./user-component-about-me.entity";
import { UserComponentEducation } from "./user-component-education.entity";
import { UserComponentExperience } from "./user-component-experience.entity";
import { UserComponentCertificate } from "./user-component-certificate.entity";

export interface User {
    id: number;
    username?: string;
    firstName?: string;
    name?: string;
    email: string;
    githubUrl?: string;
    linkedinUrl?: string;
    role: RoleEnum;
    profileImage?: string | null;
    userComponentAboutMe?: UserComponentAboutMe;
    userComponentEducation?: UserComponentEducation[];
    userComponentExperience?: UserComponentExperience[];
    userComponentCertificate?: UserComponentCertificate[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
