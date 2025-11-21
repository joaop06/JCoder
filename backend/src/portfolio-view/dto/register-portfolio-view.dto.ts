import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class RegisterPortfolioViewDto {
  @ApiPropertyOptional({
    type: 'string',
    example: 'abc123def456',
    description: 'Unique browser fingerprint for deduplication',
  })
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'https://example.com',
    description: 'Referrer URL (where it came from)',
  })
  @IsOptional()
  @IsString()
  referer?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    default: false,
    description: 'Indicates if the access was from the portfolio owner (via cookie/localStorage)',
  })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
};
