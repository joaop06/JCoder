import { IsNotEmpty, IsString } from "class-validator";

export class SignInResponseDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;
};
