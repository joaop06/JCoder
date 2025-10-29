import { ApiServiceWithRetry } from './api.service';
import { User } from '@/types/entities/user.entity';

/**
 * Centralized Images Service
 * Handles all image operations for different resource types
 */
export const ImagesService = {
    // ==================== USER PROFILE IMAGES ====================

    /**
     * Upload user profile image
     */
    async uploadUserProfileImage(file: File): Promise<User> {
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
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get user profile image URL
     */
    getUserProfileImageUrl(userId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/users/${userId}/profile-image`;
    },

    /**
     * Delete user profile image
     */
    async deleteUserProfileImage(): Promise<void> {
        try {
            await ApiServiceWithRetry.delete('/images/users/profile-image');
        } catch (error) {
            throw error;
        }
    },

    // ==================== USER CERTIFICATES IMAGES ====================

    /**
     * Upload certificate image
     */
    async uploadCertificateImage(certificateId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('certificateImage', file);

            const response = await ApiServiceWithRetry.post(
                `/images/users/certificates/${certificateId}/image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get certificate image URL
     */
    getCertificateImageUrl(certificateId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/users/certificates/${certificateId}/image`;
    },

    /**
     * Delete certificate image
     */
    async deleteCertificateImage(certificateId: number): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(
                `/images/users/certificates/${certificateId}/image`
            );
        } catch (error) {
            throw error;
        }
    },

    // ==================== APPLICATION IMAGES ====================

    /**
     * Upload application gallery images
     */
    async uploadApplicationImages(applicationId: number, files: File[]): Promise<any> {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images', file);
            });

            const response = await ApiServiceWithRetry.post(
                `/images/applications/${applicationId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application image URL
     */
    getApplicationImageUrl(applicationId: number, filename: string): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/applications/${applicationId}/images/${filename}`;
    },

    /**
     * Delete application image
     */
    async deleteApplicationImage(applicationId: number, filename: string): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(
                `/images/applications/${applicationId}/images/${filename}`
            );
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload application profile image
     */
    async uploadApplicationProfileImage(applicationId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiServiceWithRetry.post(
                `/images/applications/${applicationId}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update application profile image
     */
    async updateApplicationProfileImage(applicationId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiServiceWithRetry.put(
                `/images/applications/${applicationId}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application profile image URL
     */
    getApplicationProfileImageUrl(applicationId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/applications/${applicationId}/profile-image`;
    },

    /**
     * Delete application profile image
     */
    async deleteApplicationProfileImage(applicationId: number): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(
                `/images/applications/${applicationId}/profile-image`
            );
        } catch (error) {
            throw error;
        }
    },

    // ==================== TECHNOLOGY IMAGES ====================

    /**
     * Upload technology profile image
     */
    async uploadTechnologyProfileImage(technologyId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiServiceWithRetry.post(
                `/images/technologies/${technologyId}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get technology profile image URL
     */
    getTechnologyProfileImageUrl(technologyId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/images/technologies/${technologyId}/profile-image`;
    },

    /**
     * Delete technology profile image
     */
    async deleteTechnologyProfileImage(technologyId: number): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(
                `/images/technologies/${technologyId}/profile-image`
            );
        } catch (error) {
            throw error;
        }
    },
};

