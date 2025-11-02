import {
    IsUrl,
    IsDate,
    IsArray,
    IsNumber,
    IsString,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserComponentCertificateDto {
    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        description: 'Certificate name',
        example: 'AWS Certified Solutions Architect',
    })
    @IsNotEmpty()
    @IsString()
    certificateName!: string;

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
    issueDate!: Date;

    @ApiProperty({
        type: 'string',
        required: true,
        nullable: false,
        example: 'John Doe',
        description: 'Name of the person the certificate was issued to',
    })
    @IsNotEmpty()
    @IsString()
    issuedTo!: string;

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
        nullable: true,
        type: [Number],
        example: [1, 2],
        description: 'Array of education IDs to associate with this certificate',
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    educationIds?: number[];
};

