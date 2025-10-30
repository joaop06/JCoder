import { User } from "@/types/entities/user.entity";
import ApiService, { ApiServiceWithRetry } from "./api.service";

export const UsersService = {
    getUserStorage(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);

            return {
                id: user?.id,
                fullName: user?.fullName,
                firstName: user?.firstName,
                role: user?.role,
                email: user?.email,
                profileImage: user?.profileImage,
                githubUrl: user?.githubUrl,
                linkedinUrl: user?.linkedinUrl,
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
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return updatedUser;
    },

    // ==================== PROFILE IMAGE METHODS ====================

    /**
     * Upload user profile image
     * @param file Image file to upload
     * @returns Updated user with new profile image
     */
    async uploadProfileImage(file: File): Promise<User> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiServiceWithRetry.post(
                '/images/users/profile-image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Update local storage with new user data
            const updatedUser = response.data.data;
            const currentUser = this.getUserStorage();
            if (currentUser) {
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
            }

            return updatedUser;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get user profile image URL
     * @param userId User ID
     * @returns Full URL to the profile image
     */
    getProfileImageUrl(userId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/users/${userId}/profile-image`;
    },

    /**
     * Delete user profile image
     * @returns void
     */
    async deleteProfileImage(): Promise<void> {
        try {
            await ApiServiceWithRetry.delete('/images/users/profile-image');

            // Update local storage to remove profile image
            const currentUser = this.getUserStorage();
            if (currentUser) {
                currentUser.profileImage = null;
                localStorage.setItem('user', JSON.stringify(currentUser));
            }
        } catch (error) {
            throw error;
        }
    },
};
