import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  declare email: string;

  @ApiProperty({
    type: 'string',
    required: true,
    example: '123456',
    description: 'Verification code (6 digits)',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  declare code: string;
};

