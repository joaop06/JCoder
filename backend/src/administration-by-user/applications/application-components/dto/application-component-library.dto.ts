import {
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationComponentLibraryDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    nullable: false,
    description: 'Linked application ID',
  })
  @IsNotEmpty()
  @IsPositive()
  applicationId: number;

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
