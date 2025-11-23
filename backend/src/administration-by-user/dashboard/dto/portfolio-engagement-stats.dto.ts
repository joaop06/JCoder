import { ApiProperty } from '@nestjs/swagger';

export class PortfolioEngagementStatsDto {
  @ApiProperty({
    type: 'number',
    example: 150,
    description: 'Total unique accesses in the period',
  })
  totalViews: number;

  @ApiProperty({
    type: 'number',
    example: 120,
    description: 'Total unique visitors (excluding duplicates in the period)',
  })
  uniqueVisitors: number;

  @ApiProperty({
    type: 'number',
    example: 30,
    description: 'Portfolio owner accesses (excluded from statistics)',
  })
  ownerViews: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-15' },
        views: { type: 'number', example: 10 },
        uniqueVisitors: { type: 'number', example: 8 },
      },
    },
    description: 'Daily statistics in the period',
  })
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;

  @ApiProperty({
    type: 'object',
    properties: {
      country: { type: 'string', example: 'BR' },
      count: { type: 'number', example: 45 },
    },
    description: 'Top visitor origin countries',
  })
  topCountries: Array<{
    country: string;
    count: number;
  }>;

  @ApiProperty({
    type: 'object',
    properties: {
      referer: { type: 'string', example: 'https://google.com' },
      count: { type: 'number', example: 20 },
    },
    description: 'Top referrers (traffic sources)',
  })
  topReferers: Array<{
    referer: string;
    count: number;
  }>;
}

