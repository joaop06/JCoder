import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpertiseLevel } from '../enums/expertise-level.enum';

export class CreateTechnologyDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Node.js',
        description: 'Technology name (must be unique)',
    })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiPropertyOptional({
        enum: ExpertiseLevel,
        required: false,
        nullable: false,
        example: ExpertiseLevel.INTERMEDIATE,
        description: 'Expertise level in the technology',
    })
    @IsOptional()
    @IsEnum(ExpertiseLevel)
    expertiseLevel?: ExpertiseLevel;
};
