import {
    IsArray,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { User } from '../../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentAboutMeHighlightDto } from './user-component-about-me-highlight.dto';

export class UserComponentAboutMeDto {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    })
    @IsNotEmpty()
    @IsString()
    username!: string;

    @ApiPropertyOptional({
        type: () => User,
        nullable: true,
        description: 'User',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    @Expose()
    user?: User;

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
