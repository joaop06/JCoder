import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, Max, Min, IsString } from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
        description: 'Page number',
    })
    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    page?: number = 1;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of items per page',
    })
    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        type: 'string',
        default: 'createdAt',
        description: 'Field to sort by',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        type: 'string',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
        description: 'Sort order',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PaginatedResponseDto<T> {
    @ApiPropertyOptional()
    data: T[];

    @ApiPropertyOptional()
    total?: number;

    @ApiPropertyOptional()
    page?: number;

    @ApiPropertyOptional()
    limit?: number;

    @ApiPropertyOptional()
    totalPages?: number;

    @ApiPropertyOptional()
    hasNext?: boolean;

    @ApiPropertyOptional()
    hasPrev?: boolean;

    @ApiPropertyOptional()
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}