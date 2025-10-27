import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../@common/dto/pagination.dto';

export class QueryApplicationDto extends PaginationDto {
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

