import { MobilePlatformEnum } from "@/types/enums/mobile-plataform.enum";

export interface ApplicationComponentMobileDto {
    platform: MobilePlatformEnum;
    downloadUrl?: string;
};
