import ApiService from "./api.service";
import { LoginRequest, LoginResponse } from "@/types/api/login.type";
import { ApiResponse } from "@/types/api/pagination.type";

export const AuthService = {
    async login({ email, password }: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await ApiService.post('/auth/sign-in', { email, password });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
};
