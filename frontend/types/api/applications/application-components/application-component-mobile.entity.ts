import { MobilePlatformEnum } from "@/types/enums/mobile-plataform.enum";

export interface ApplicationComponentMobile {
    applicationId: number;
    username: string;
    platform: MobilePlatformEnum;
    downloadUrl?: string;
    associatedApiId?: number;
};
