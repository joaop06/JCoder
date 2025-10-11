import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Application } from "../../entities/application.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ApplicationTypeEnum } from "../../enums/application-type.enum";
import { ApplicationComponentApiDto } from "./application-component-api.dto";
import { ApplicationComponentMobileDto } from "./application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "./application-component-library.dto";
import { ApplicationComponentFrontendDto } from "./application-component-frontend.dto";

export class CreateComponentsForTypeDto {
    @ApiProperty({
        required: true,
        type: () => Application,
        description: 'Application record to be linked with components',
    })
    @IsNotEmpty()
    @Type(() => Application)
    @ValidateNested()
    application: Application;

    @ApiProperty({
        required: true,
        type: () => ApplicationComponentsDto,
        description: 'Components composition from the application',
    })
    @IsNotEmpty()
    @Type(() => ApplicationComponentsDto)
    @ValidateNested()
    dtos: ApplicationComponentsDto;

    @ApiProperty({
        required: true,
        enum: ApplicationTypeEnum,
        example: ApplicationTypeEnum.API,
        description: 'Type of the components composition from the application',
    })
    @IsNotEmpty()
    @IsEnum(ApplicationTypeEnum)
    applicationType: ApplicationTypeEnum;
};

export class ApplicationComponentsDto {
    @ApiPropertyOptional({
        nullable: true,
        required: false,
        type: () => ApplicationComponentApiDto,
        description: 'API application type component',
    })
    @IsOptional()
    @Type(() => ApplicationComponentApiDto)
    @ValidateNested()
    applicationComponentApi?: ApplicationComponentApiDto;

    @ApiPropertyOptional({
        nullable: true,
        required: false,
        type: () => ApplicationComponentMobileDto,
        description: 'Mobile application type component',
    })
    @IsOptional()
    @Type(() => ApplicationComponentMobileDto)
    @ValidateNested()
    applicationComponentMobile?: ApplicationComponentMobileDto;

    @ApiPropertyOptional({
        nullable: true,
        required: false,
        type: () => ApplicationComponentLibraryDto,
        description: 'Library application type component',
    })
    @IsOptional()
    @Type(() => ApplicationComponentLibraryDto)
    @ValidateNested()
    applicationComponentLibrary?: ApplicationComponentLibraryDto;

    @ApiPropertyOptional({
        nullable: true,
        required: false,
        type: () => ApplicationComponentFrontendDto,
        description: 'Frontend application type component',
    })
    @IsOptional()
    @Type(() => ApplicationComponentFrontendDto)
    @ValidateNested()
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
};
