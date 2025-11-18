import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { ApplicationComponentApiDto } from "../application-components/dto/application-component-api.dto";
import { ApplicationComponentMobileDto } from "../application-components/dto/application-component-mobile.dto";
import { ApplicationComponentLibraryDto } from "../application-components/dto/application-component-library.dto";
import { ApplicationComponentFrontendDto } from "../application-components/dto/application-component-frontend.dto";

export class UpdateApplicationDto {
    @ApiPropertyOptional({
        type: 'string',
        nullable: false,
        required: false,
        example: 'Any Name',
        description: 'Your application name',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: false,
        required: false,
        example: 'This is the first application',
        description: 'A simplified description of the application',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        type: 'string',
        required: false,
        nullable: true,
        enum: ApplicationTypeEnum,
        example: ApplicationTypeEnum.API,
        description: 'Application type (optional, kept for backward compatibility)',
    })
    @IsOptional()
    @IsEnum(ApplicationTypeEnum)
    applicationType?: ApplicationTypeEnum;

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
        type: 'boolean',
        required: false,
        nullable: false,
        example: true,
        description: 'Indicates whether the application is active',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

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

    @ApiPropertyOptional({
        nullable: true,
        required: false,
        type: [Number],
        example: [1, 2, 3],
        description: 'Array of technology IDs to associate with the application',
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    technologyIds?: number[];
};
