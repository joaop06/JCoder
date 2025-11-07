import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsUrl, Matches } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({
        type: 'string',
        required: false,
        example: 'johndoe',
        description: 'Unique username for login and portfolio URL',
        minLength: 3,
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username must contain only letters, numbers, underscores, and hyphens',
    })
    declare username?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'John',
        description: 'User first name',
    })
    @IsOptional()
    @IsString()
    declare firstName?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'John Doe',
        description: 'User full name',
    })
    @IsOptional()
    @IsString()
    declare fullName?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'your@email.com',
        description: 'User email',
    })
    @IsOptional()
    @IsString()
    @IsEmail()
    declare email?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'https://github.com/johndoe',
        description: 'GitHub profile URL',
    })
    @IsOptional()
    @IsString()
    @IsUrl()
    declare githubUrl?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'https://linkedin.com/in/johndoe',
        description: 'LinkedIn profile URL',
    })
    @IsOptional()
    @IsString()
    @IsUrl()
    declare linkedinUrl?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'CurrentPassword123!',
        description: 'Current password (required if changing password)',
    })
    @IsOptional()
    @IsString()
    declare currentPassword?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'NewPassword123!',
        description: 'New password',
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    declare newPassword?: string;

    @ApiProperty({
        type: 'string',
        required: false,
        example: 'profile-123e4567-e89b-12d3-a456-426614174000.jpg',
        description: 'User profile image filename',
    })
    @IsOptional()
    @IsString()
    declare profileImage?: string;
};
