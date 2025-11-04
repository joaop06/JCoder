import {
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';

export class UserComponentAboutMeHighlightDto {
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
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked About Me component ID',
    })
    @IsNotEmpty()
    @IsNumber()
    aboutMeId: number;

    @ApiPropertyOptional({
        nullable: true,
        description: 'About Me',
        type: () => UserComponentAboutMe,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => UserComponentAboutMe)
    @Expose()
    aboutMe?: UserComponentAboutMe;

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
