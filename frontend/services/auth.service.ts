import ApiService from "./api.service";
import { LoginRequest, LoginResponse } from "@/types/api/login.type";

export const AuthService = {
    async login({ email, password }: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await ApiService.post('/auth/sign-in', { email, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
