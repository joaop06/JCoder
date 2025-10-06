import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ApplicationComponentLibraryDto {
  @IsUrl()
  @IsNotEmpty()
  packageManagerUrl: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readmeContent?: string;
};
