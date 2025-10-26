import { User } from "@/types/entities/user.entity";
import ApiService from "./api.service";

export const UsersService = {
    getUserStorage(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);

            return {
                id: user?.id,
                name: user?.name,
                role: user?.role,
                email: user?.email,
                createdAt: user?.createdAt,
                updatedAt: user?.updatedAt,
                deletedAt: user?.deletedAt,
            };
        } catch {
            return null;
        }
    },
    clearUserStorage(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    },
    async updateProfile(data: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<User> {
        const response = await ApiService.patch('/users/profile', data);

        // Update local storage with new user data
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return updatedUser;
    }
};
