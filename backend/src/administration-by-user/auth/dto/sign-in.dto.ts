import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @ApiProperty({
        type: 'string',
        required: true,
        example: 'johndoe',
        description: 'User username for login',
    })
    @IsNotEmpty()
    @IsString()
    declare username: string;

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
