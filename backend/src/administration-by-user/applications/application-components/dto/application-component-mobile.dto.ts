import {
  IsUrl,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MobilePlatformEnum } from '../../enums/mobile-platform.enum';

export class ApplicationComponentMobileDto {
  @ApiProperty({
    required: true,
    nullable: false,
    enum: MobilePlatformEnum,
    example: MobilePlatformEnum.ANDROID,
    description: 'Type of platform on which the mobile application was developed',
  })
  @IsNotEmpty()
  @IsEnum(MobilePlatformEnum)
  platform: MobilePlatformEnum;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    description: 'URL to download the application',
    example: 'https://example.mobile.com/download/1.1.0',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  downloadUrl?: string;
};
