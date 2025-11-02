import {
    IsDate,
    IsString,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserComponentEducationDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'University of Technology',
        description: 'Educational institution name',
    })
    @IsNotEmpty()
    @IsString()
    institutionName!: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Computer Science',
        description: 'Course/field of study name',
    })
    @IsNotEmpty()
    @IsString()
    courseName!: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: 'Bachelor\'s Degree',
        description: 'Degree/qualification type',
    })
    @IsOptional()
    @IsString()
    degree?: string;

    @ApiProperty({
        required: true,
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Education start date',
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate!: Date;

    @ApiPropertyOptional({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Education end date (or expected end date)',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiProperty({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if currently studying (if true, endDate should be null or future date)',
    })
    @IsOptional()
    @IsBoolean()
    isCurrentlyStudying?: boolean;
};
