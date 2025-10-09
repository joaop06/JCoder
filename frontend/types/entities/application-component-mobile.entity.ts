import { Application } from "./application.entity";
import { MobilePlatformEnum } from "../enums/mobile-plataform.enum";

export interface ApplicationComponentMobile {
    applicationId: number;
    platform: MobilePlatformEnum;
    downloadUrl?: string;
    associatedApiId?: number;
    associatedApi?: Application;
};
