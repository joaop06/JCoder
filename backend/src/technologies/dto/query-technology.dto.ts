import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { TechnologyCategoryEnum } from '../enums/technology-category.enum';

export class QueryTechnologyDto extends PaginationDto {
    @ApiPropertyOptional({
        type: 'string',
        required: false,
        enum: TechnologyCategoryEnum,
        example: TechnologyCategoryEnum.BACKEND,
        description: 'Filter technologies by category',
    })
    @IsOptional()
    @IsEnum(TechnologyCategoryEnum)
    category?: TechnologyCategoryEnum;

    @ApiPropertyOptional({
        type: 'boolean',
        required: false,
        example: true,
        description: 'Filter by active status',
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}

