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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { ApplicationComponentApiDto } from '../application-components/dto/application-component-api.dto';
import { ApplicationComponentMobileDto } from '../application-components/dto/application-component-mobile.dto';
import { ApplicationComponentLibraryDto } from '../application-components/dto/application-component-library.dto';
import { ApplicationComponentFrontendDto } from '../application-components/dto/application-component-frontend.dto';

export class CreateApplicationDto {
  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    example: 'Any Name',
    description: 'Your application name',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 1,
    type: 'number',
    required: true,
    nullable: false,
    description: 'User who created the application',
  })
  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    example: 'This is the first application',
    description: 'A simplified description of the application',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    enum: ApplicationTypeEnum,
    example: ApplicationTypeEnum.API,
    description: 'Application type (involves defining components)',
  })
  @IsNotEmpty()
  @IsEnum(ApplicationTypeEnum)
  applicationType!: ApplicationTypeEnum;

  @ApiPropertyOptional({
    nullable: true,
    type: 'string',
    required: false,
    example: 'https://github.com/user/your-application',
    description: 'GitHub URL to access the repository',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    type: () => ApplicationComponentApiDto,
    description: 'API application component',
  })
  @IsOptional()
  @Type(() => ApplicationComponentApiDto)
  @ValidateNested()
  applicationComponentApi?: ApplicationComponentApiDto;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    type: () => ApplicationComponentMobileDto,
    description: 'Mobile application component',
  })
  @IsOptional()
  @Type(() => ApplicationComponentMobileDto)
  @ValidateNested()
  applicationComponentMobile?: ApplicationComponentMobileDto;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    type: () => ApplicationComponentLibraryDto,
    description: 'Library application component',
  })
  @IsOptional()
  @Type(() => ApplicationComponentLibraryDto)
  @ValidateNested()
  applicationComponentLibrary?: ApplicationComponentLibraryDto;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    type: () => ApplicationComponentFrontendDto,
    description: 'Frontend application component',
  })
  @IsOptional()
  @Type(() => ApplicationComponentFrontendDto)
  @ValidateNested()
  applicationComponentFrontend?: ApplicationComponentFrontendDto;
}
