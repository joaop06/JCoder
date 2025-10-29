import {
    IsArray,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
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
        isArray: true,
        nullable: true,
        description: 'Highlights/achievements',
        type: () => UserComponentAboutMeHighlightDto,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserComponentAboutMeHighlightDto)
    highlights?: UserComponentAboutMeHighlightDto[];
};
