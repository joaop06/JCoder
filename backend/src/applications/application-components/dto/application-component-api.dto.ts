import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ApplicationComponentApiDto {
  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsUrl()
  @IsNotEmpty()
  documentationUrl: string;

  @IsUrl()
  @IsNotEmpty()
  apiUrl: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  healthCheckEndpoint?: string;
};
