import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationComponentFrontendDto {
  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Hosted Frontend domains',
    example: 'https://example.frontend.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  frontendUrl: string;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    description: 'Route to check application health',
    example: 'https://example.frontend.com/screenshot',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  screenshotUrl?: string;
};
