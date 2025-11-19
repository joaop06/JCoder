import { User } from "../users/user.entity";

export interface SignInDto {
    password: string;
    username: string;
};

export interface SignInResponseDto {
    user: User;
    accessToken: string;
};
