import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  redirectUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

