import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class RegisterPortfolioViewDto {
  @ApiPropertyOptional({
    type: 'string',
    example: 'abc123def456',
    description: 'Fingerprint único do navegador para deduplicação',
  })
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'https://example.com',
    description: 'URL de referência (de onde veio)',
  })
  @IsOptional()
  @IsString()
  referer?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    default: false,
    description: 'Indica se o acesso foi do próprio dono do portfólio (via cookie/localStorage)',
  })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
};
