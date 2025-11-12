import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SendEmailVerificationDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'user@example.com',
    description: 'Email address to verify',
  })
  @IsNotEmpty()
  @IsEmail()
  declare email: string;
};

