import {
  IsUrl,
  IsString,
  IsOptional,
} from 'class-validator';

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
};
