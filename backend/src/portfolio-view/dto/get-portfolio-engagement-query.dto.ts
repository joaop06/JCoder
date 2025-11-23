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
    description: 'Date range type',
  })
  @IsOptional()
  @IsEnum(DateRangeType)
  rangeType?: DateRangeType = DateRangeType.MONTH;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2024-01-01',
    description: 'Start date (used when rangeType is CUSTOM)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2024-01-31',
    description: 'End date (used when rangeType is CUSTOM)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
};
