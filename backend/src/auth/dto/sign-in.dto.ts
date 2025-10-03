import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    declare email: string;

    @IsNotEmpty()
    @IsString()
    declare password: string;
};
