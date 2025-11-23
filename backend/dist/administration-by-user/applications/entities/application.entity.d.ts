import { User } from '../../users/entities/user.entity';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { Technology } from '../../technologies/entities/technology.entity';
import { ApplicationComponentApi } from '../application-components/entities/application-component-api.entity';
import { ApplicationComponentMobile } from '../application-components/entities/application-component-mobile.entity';
import { ApplicationComponentLibrary } from '../application-components/entities/application-component-library.entity';
import { ApplicationComponentFrontend } from '../application-components/entities/application-component-frontend.entity';
export declare class Application {
    id: number;
    userId: number;
    user?: User;
    name: string;
    description: string;
    applicationType?: ApplicationTypeEnum;
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
}
