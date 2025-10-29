import {
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentAboutMeHighlightDto } from './user-component-about-me-highlight.dto';

export class UserComponentAboutMeDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'John Doe',
        description: 'User full name',
    })
    @IsNotEmpty()
    @IsString()
    fullName!: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: 'Senior Software Engineer',
        description: 'User job title/occupation',
    })
    @IsOptional()
    @IsString()
    occupation?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: '<p>Hello, I am a software engineer...</p>',
        description: 'Rich text description (HTML formatted)',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        nullable: true,
        type: () => [UserComponentAboutMeHighlightDto],
        description: 'Highlights/achievements',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserComponentAboutMeHighlightDto)
    highlights?: UserComponentAboutMeHighlightDto[];
};

