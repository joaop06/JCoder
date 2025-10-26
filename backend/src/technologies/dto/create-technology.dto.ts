import {
    IsUrl,
    IsEnum,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TechnologyCategoryEnum } from '../enums/technology-category.enum';

export class CreateTechnologyDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Node.js',
        description: 'Technology name (must be unique)',
    })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        type: 'string',
        required: false,
        nullable: true,
        example: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        description: 'Detailed description of the technology',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        enum: TechnologyCategoryEnum,
        example: TechnologyCategoryEnum.BACKEND,
        description: 'Technology category for organization',
    })
    @IsNotEmpty()
    @IsEnum(TechnologyCategoryEnum)
    category!: TechnologyCategoryEnum;

    @ApiPropertyOptional({
        type: 'number',
        required: false,
        nullable: false,
        example: 1,
        default: 999,
        description: 'Display order for sorting (lower numbers appear first)',
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    displayOrder?: number;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        required: false,
        example: 'https://nodejs.org',
        description: 'Official website URL of the technology',
    })
    @IsOptional()
    @IsString()
    @IsUrl()
    officialUrl?: string;
}

