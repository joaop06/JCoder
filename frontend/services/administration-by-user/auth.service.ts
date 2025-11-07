import { ApiService } from "../api.service";
import { SignInDto, SignInResponseDto, CreateUserDto } from "@/types";
import { User } from "@/types/api/users/user.entity";

export const AuthService = {
    /**
     * Sign in user
     * POST /auth/sign-in
     */
    async signIn({ username, password }: SignInDto): Promise<SignInResponseDto> {
        try {
            const response = await ApiService.post('/auth/sign-in', { username, password });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Register new user
     * POST /portfolio/register
     */
    async register(createUserDto: CreateUserDto): Promise<User> {
        try {
            const response = await ApiService.post('/portfolio/register', createUserDto);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
};
