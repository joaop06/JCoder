import {
    IsEnum,
    IsString,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { ExpertiseLevel } from '../enums/expertise-level.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTechnologyDto {
    @ApiPropertyOptional({
        type: 'string',
        required: false,
        nullable: false,
        example: 'username',
        description: 'Username of the user',
    })
    @IsOptional()
    @IsString()
    username?: string;

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
