import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum DateRangeType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class GetPortfolioEngagementQueryDto {
  @ApiPropertyOptional({
    enum: DateRangeType,
    default: DateRangeType.MONTH,
    description: 'Tipo de range de data',
  })
  @IsOptional()
  @IsEnum(DateRangeType)
  rangeType?: DateRangeType = DateRangeType.MONTH;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2024-01-01',
    description: 'Data inicial (usado quando rangeType é CUSTOM)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2024-01-31',
    description: 'Data final (usado quando rangeType é CUSTOM)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
};
