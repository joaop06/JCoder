import {
    ApplicationComponentApi,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
} from './application-components';
import type { Technology } from '../technologies/technology.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';

export interface Application {
    id: number;
    userId: string;
    name: string;
    description: string;
    applicationType: ApplicationTypeEnum;
    githubUrl?: string;
    isActive: boolean;
    images?: string[];
    profileImage?: string;
    displayOrder: number;
    applicationComponentApi?: ApplicationComponentApi;
    applicationComponentMobile?: ApplicationComponentMobile;
    applicationComponentLibrary?: ApplicationComponentLibrary;
    applicationComponentFrontend?: ApplicationComponentFrontend;
    technologies?: Technology[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
