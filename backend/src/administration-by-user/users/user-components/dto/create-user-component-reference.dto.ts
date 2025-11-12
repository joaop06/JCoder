import {
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserComponentReferenceDto {
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
        description: 'Reference person name',
        example: 'Marissa Leeds',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        description: 'Company or organization name',
        example: 'Gold Coast Hotel',
    })
    @IsOptional()
    @IsString()
    company?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        description: 'Reference email',
        example: 'mleeds@goldcoast.com',
    })
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        description: 'Reference phone number',
        example: '732-189-0909',
    })
    @IsOptional()
    @IsString()
    phone?: string;
};

