import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
export declare class ApplicationComponentFrontend {
    applicationId: number;
    application?: Application;
    userId: number;
    user?: User;
    frontendUrl: string;
    screenshotUrl?: string;
}
