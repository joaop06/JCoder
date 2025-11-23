import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
import { MobilePlatformEnum } from "../../enums/mobile-platform.enum";
export declare class ApplicationComponentMobile {
    applicationId: number;
    application?: Application;
    userId: number;
    user?: User;
    platform: MobilePlatformEnum;
    downloadUrl?: string;
}
