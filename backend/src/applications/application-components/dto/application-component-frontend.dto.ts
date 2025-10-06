import {
  IsUrl,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ApplicationComponentFrontendDto {
  @IsUrl()
  @IsNotEmpty()
  frontendUrl: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  screenshotUrl?: string;
};
