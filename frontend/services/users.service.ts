import { User } from "@/types/entities/user.entity";

export const UsersService = {
    getUserStorage(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);

            return {
                id: user?.id,
                role: user?.role,
                email: user?.email,
                applications: user?.applications,
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
    }
};
