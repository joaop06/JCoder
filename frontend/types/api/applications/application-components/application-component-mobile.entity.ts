import { MobilePlatformEnum } from "@/types/enums/mobile-plataform.enum";

export interface ApplicationComponentMobile {
    userId?: number;
    applicationId?: number;

    platform: MobilePlatformEnum;
    downloadUrl?: string;
};
