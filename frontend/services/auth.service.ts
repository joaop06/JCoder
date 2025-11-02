import { ApiServiceWithRetry } from "./api.service";
import { LoginRequest, LoginResponse } from "@/types/api/login.type";

export const AuthService = {
    async login({ username, password }: LoginRequest): Promise<LoginResponse> {
        try {
            // Backend expects 'username' field, not 'email'
            const response = await ApiServiceWithRetry.post('/auth/sign-in', { username, password });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
};
