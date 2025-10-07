import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Application } from "../../entities/application.entity";
import { ApplicationTypeEnum } from "../../enums/application-type.enum";
import { ApplicationComponentApiDto } from "./application-component-api.dto";
import { ApplicationComponentMobileDto } from "./application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "./application-component-library.dto";
import { ApplicationComponentFrontendDto } from "./application-component-frontend.dto";

export class CreateComponentsForTypeDto {
    @IsNotEmpty()
    @Type(() => Application)
    application: Application;

    @IsNotEmpty()
    @Type(() => ApplicationComponentsDto)
    @ValidateNested()
    dtos: ApplicationComponentsDto;

    @IsNotEmpty()
    @IsEnum(ApplicationTypeEnum)
    applicationType: ApplicationTypeEnum;
};

export class ApplicationComponentsDto {
    @IsOptional()
    @Type(() => ApplicationComponentApiDto)
    @ValidateNested()
    applicationComponentApi?: ApplicationComponentApiDto;

    @IsOptional()
    @Type(() => ApplicationComponentMobileDto)
    @ValidateNested()
    applicationComponentMobile?: ApplicationComponentMobileDto;

    @IsOptional()
    @Type(() => ApplicationComponentLibraryDto)
    @ValidateNested()
    applicationComponentLibrary?: ApplicationComponentLibraryDto;

    @IsOptional()
    @Type(() => ApplicationComponentFrontendDto)
    @ValidateNested()
    applicationComponentFrontend?: ApplicationComponentFrontendDto;
};
