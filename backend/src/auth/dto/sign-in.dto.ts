import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @ApiProperty({
        type: 'string',
        required: true,
        example: 'your@email.com',
        description: 'User access email',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    declare email: string;

    @ApiProperty({
        type: 'string',
        required: true,
        example: 'YourPassword123!',
        description: 'User access password',
    })
    @IsNotEmpty()
    @IsString()
    declare password: string;
};
