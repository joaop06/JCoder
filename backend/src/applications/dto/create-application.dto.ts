import {
  IsUrl,
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ApplicationTypeEnum)
  @IsNotEmpty()
  applicationType: ApplicationTypeEnum;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationComponentApiDto)
  applicationComponentApi?: ApplicationComponentApiDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationComponentFrontendDto)
  applicationComponentFrontend?: ApplicationComponentFrontendDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationComponentMobileDto)
  applicationComponentMobile?: ApplicationComponentMobileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationComponentLibraryDto)
  applicationComponentLibrary?: ApplicationComponentLibraryDto;
};
