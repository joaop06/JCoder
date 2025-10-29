import {
    IsString,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserComponentAboutMeHighlightDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: '10+ Years Experience',
        description: 'Highlight title',
    })
    @IsNotEmpty()
    @IsString()
    title!: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: 'Building amazing software',
        description: 'Highlight subtitle',
    })
    @IsOptional()
    @IsString()
    subtitle?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: '🚀',
        description: 'Emoji icon for the highlight',
    })
    @IsOptional()
    @IsString()
    emoji?: string;
};

