import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'johndoe',
    description: 'Unique username for login and portfolio URL',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username must contain only letters, numbers, underscores, and hyphens',
  })
  declare username: string;

  @ApiProperty({
    type: 'string',
    required: true,
    example: 'YourSecurePassword123!',
    description: 'User password',
  })
  @IsNotEmpty()
  @IsString()
  declare password: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'your@email.com',
    description: 'User contact email',
  })
  @IsOptional()
  @IsEmail()
  declare email?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'John',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  declare firstName?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'John Doe',
    description: 'User full name',
  })
  @IsOptional()
  @IsString()
  declare fullName?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @IsOptional()
  @IsString()
  declare githubUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @IsOptional()
  @IsString()
  declare linkedinUrl?: string;
};

