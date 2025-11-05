import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationComponentApiDto {
  @ApiProperty({
    required: true,
    nullable: false,
    example: 'example.api.com',
    description: 'Hosted API domains',
  })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: 'https://example.api.com/api/v1',
    description: 'Route to consume the application',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  apiUrl: string;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    example: 'https://example.api.com/docs',
    description: 'Path to verify application documentation',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    example: 'https://example.api.com/health',
    description: 'Route to check application health',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  healthCheckEndpoint?: string;
};
