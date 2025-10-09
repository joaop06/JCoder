import { Application } from "./application.entity";

export interface ApplicationComponentFrontend {
    applicationId: number;
    frontendUrl: string;
    screenshotUrl?: string;
    associatedApiId?: number;
    associatedApi?: Application;
};
