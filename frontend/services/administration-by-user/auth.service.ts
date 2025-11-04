import { ApiService } from "../api.service";
import { SignInDto, SignInResponseDto } from "@/types";

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
};
