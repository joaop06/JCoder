import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationComponentLibraryDto {
  @ApiProperty({
    required: true,
    nullable: false,
    description: 'URL of the library package manager',
    example: 'https://www.npmjs.com/package/your-package',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  packageManagerUrl: string;

  @ApiPropertyOptional({
    nullable: true,
    required: false,
    description: 'Library README contents',
  })
  @IsOptional()
  @IsString()
  readmeContent?: string;
};
