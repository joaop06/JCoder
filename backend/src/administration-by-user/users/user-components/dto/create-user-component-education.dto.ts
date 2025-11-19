import {
    IsDate,
    IsArray,
    IsNumber,
    IsString,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserComponentCertificateDto } from './create-user-component-certificate.dto';

export class CreateUserComponentEducationDto {
    @ApiPropertyOptional({
        example: 1,
        type: 'number',
        nullable: true,
        description: 'User ID (automatically filled by backend if not provided)',
    })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'University of Technology',
        description: 'Educational institution name',
    })
    @IsNotEmpty()
    @IsString()
    institutionName: string;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Computer Science',
        description: 'Course/field of study name',
    })
    @IsNotEmpty()
    @IsString()
    courseName: string;

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
    startDate: Date;

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
    isCurrentlyStudying: boolean;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => CreateUserComponentCertificateDto,
        description: 'Related certificates (ManyToMany relationship)',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUserComponentCertificateDto)
    @Expose()
    certificates?: CreateUserComponentCertificateDto[];
};
