import { User } from "../entities/user.entity";

export interface LoginRequest {
    password: string;
    username: string;
};

export interface LoginResponse {
    user: User;
    accessToken: string;
};
