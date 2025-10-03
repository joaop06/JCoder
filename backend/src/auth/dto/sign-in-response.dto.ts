import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { User } from "../../users/entities/user.entity";

export class SignInResponseDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @Type(() => User)
    user: User;
};
