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
import { User } from '../../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentEducationDto } from './user-component-education.dto';

export class UserComponentCertificateDto {
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
    username: string;

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
        isArray: true,
        nullable: true,
        type: () => UserComponentEducationDto,
        description: 'Related education records (ManyToMany relationship)',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserComponentEducationDto)
    @Expose()
    educations?: UserComponentEducationDto[];
};
