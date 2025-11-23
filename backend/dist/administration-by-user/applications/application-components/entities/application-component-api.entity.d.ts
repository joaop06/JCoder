import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
export declare class ApplicationComponentApi {
    applicationId: number;
    application?: Application;
    userId: number;
    user?: User;
    domain: string;
    apiUrl: string;
    documentationUrl?: string;
    healthCheckEndpoint?: string;
}
