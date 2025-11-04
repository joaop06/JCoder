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
import { User } from '../../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentCertificateDto } from './user-component-certificate.dto';

export class UserComponentEducationDto {
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
        nullable: true,
        type: () => User,
        description: 'User',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    @Expose()
    user?: User;

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
    isCurrentlyStudying: boolean;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => UserComponentCertificateDto,
        description: 'Related certificates (ManyToMany relationship)',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserComponentCertificateDto)
    @Expose()
    certificates?: UserComponentCertificateDto[];
};
