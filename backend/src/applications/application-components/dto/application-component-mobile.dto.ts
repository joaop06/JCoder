import {
  IsUrl,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { MobilePlatformEnum } from '../../enums/mobile-platform.enum';

export class ApplicationComponentMobileDto {
  @IsEnum(MobilePlatformEnum)
  @IsNotEmpty()
  platform: MobilePlatformEnum;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  downloadUrl?: string;
};
