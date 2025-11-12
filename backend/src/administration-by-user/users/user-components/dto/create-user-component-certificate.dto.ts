import {
    IsUrl,
    IsDate,
    IsArray,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserComponentEducationDto } from './create-user-component-education.dto';

export class CreateUserComponentCertificateDto {
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
        description: 'Certificate name',
        example: 'AWS Certified Solutions Architect',
    })
    @IsNotEmpty()
    @IsString()
    certificateName: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        example: 'AWS-1234567890',
        description: 'Certificate registration number',
    })
    @IsOptional()
    @IsString()
    registrationNumber?: string;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        description: 'URL to verify certificate authenticity',
        example: 'https://verify.credential.com/certificate/123456',
    })
    @IsOptional()
    @IsString()
    @IsUrl()
    verificationUrl?: string;

    @ApiProperty({
        required: true,
        nullable: false,
        type: () => Date,
        example: new Date('2023-01-15'),
        description: 'Certificate issuance date',
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    issueDate: Date;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'John Doe',
        description: 'Name of the person the certificate was issued to',
    })
    @IsNotEmpty()
    @IsString()
    issuedTo: string;

    @ApiPropertyOptional({
        nullable: true,
        type: 'string',
        example: 'certificate-profile.png',
        description: 'Certificate profile image filename',
    })
    @IsOptional()
    @IsString()
    profileImage?: string;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => CreateUserComponentEducationDto,
        description: 'Related education records (ManyToMany relationship)',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateUserComponentEducationDto)
    @Expose()
    educations?: CreateUserComponentEducationDto[];

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: [Number],
        description: 'Education IDs to link to this certificate (alternative to educations array)',
        example: [1, 2, 3],
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    educationIds?: number[];
};
