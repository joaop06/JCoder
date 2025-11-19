import {
    IsArray,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserComponentAboutMeHighlightDto } from './create-user-component-about-me-highlight.dto';

export class CreateUserComponentAboutMeDto {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'User ID',
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;

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
        type: () => CreateUserComponentAboutMeHighlightDto,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUserComponentAboutMeHighlightDto)
    highlights?: CreateUserComponentAboutMeHighlightDto[];
};
