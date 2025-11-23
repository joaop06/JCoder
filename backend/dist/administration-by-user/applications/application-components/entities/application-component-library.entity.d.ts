import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
export declare class ApplicationComponentLibrary {
    applicationId: number;
    application?: Application;
    userId: number;
    user?: User;
    packageManagerUrl: string;
    readmeContent?: string;
}
