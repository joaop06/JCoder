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
import { CreateUserComponentExperiencePositionDto } from './create-user-component-experience-position.dto';

export class CreateUserComponentExperienceDto {
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
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    })
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => CreateUserComponentExperiencePositionDto,
        description: 'Positions held at this company',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUserComponentExperiencePositionDto)
    positions?: CreateUserComponentExperiencePositionDto[];
};
