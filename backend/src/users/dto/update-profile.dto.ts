import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({
        type: 'string',
        required: false,
        example: 'John Doe',
        description: 'User full name',
    })
    @IsOptional()
    @IsString()
    declare name?: string;

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
};

