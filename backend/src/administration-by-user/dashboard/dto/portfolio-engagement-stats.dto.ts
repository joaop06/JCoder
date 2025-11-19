import { ApiProperty } from '@nestjs/swagger';

export class PortfolioEngagementStatsDto {
  @ApiProperty({
    type: 'number',
    example: 150,
    description: 'Total de acessos únicos no período',
  })
  totalViews: number;

  @ApiProperty({
    type: 'number',
    example: 120,
    description: 'Total de visitantes únicos (excluindo duplicatas no período)',
  })
  uniqueVisitors: number;

  @ApiProperty({
    type: 'number',
    example: 30,
    description: 'Acessos do próprio dono do portfólio (excluídos das estatísticas)',
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
    description: 'Estatísticas diárias no período',
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
    description: 'Top países de origem dos visitantes',
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
    description: 'Top referrers (origens de tráfego)',
  })
  topReferers: Array<{
    referer: string;
    count: number;
  }>;
}

