import {
    User,
    Technology,
    Application,
} from '@/types';
import { ApiService } from '../api.service';

/**
 * Centralized Images Service
 * Handles all image operations for different resource types
 * All routes are prefixed with :username/images
 */
export const ImagesService = {
    // ==================== APPLICATION IMAGES ====================

    /**
     * Upload application gallery images
     * POST /:username/images/applications/:id
     */
    async uploadApplicationImages(username: string, applicationId: number, files: File[]): Promise<Application> {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images', file);
            });

            const response = await ApiService.post(
                `/${username}/images/applications/${applicationId}`,
                formData
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application image URL
     * GET /:username/images/applications/:id/:filename
     */
    getApplicationImageUrl(username: string, applicationId: number, filename: string): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/${username}/images/applications/${applicationId}/${filename}`;
    },

    /**
     * Delete application image
     * DELETE /:username/images/applications/:id/:filename
     */
    async deleteApplicationImage(username: string, applicationId: number, filename: string): Promise<void> {
        try {
            await ApiService.delete(
                `/${username}/images/applications/${applicationId}/${filename}`
            );
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload application profile image
     * POST /:username/images/applications/:id/profile-image
     */
    async uploadApplicationProfileImage(username: string, applicationId: number, file: File): Promise<Application> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.post(
                `/${username}/images/applications/${applicationId}/profile-image`,
                formData
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update application profile image
     * PUT /:username/images/applications/:id/profile-image
     */
    async updateApplicationProfileImage(username: string, applicationId: number, file: File): Promise<Application> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.put(
                `/${username}/images/applications/${applicationId}/profile-image`,
                formData
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application profile image URL
     * GET /:username/images/applications/:id/profile-image
     */
    getApplicationProfileImageUrl(username: string, applicationId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/${username}/images/applications/${applicationId}/profile-image`;
    },

    /**
     * Delete application profile image
     * DELETE /:username/images/applications/:id/profile-image
     */
    async deleteApplicationProfileImage(username: string, applicationId: number): Promise<void> {
        try {
            await ApiService.delete(
                `/${username}/images/applications/${applicationId}/profile-image`
            );
        } catch (error) {
            throw error;
        }
    },

    // ==================== TECHNOLOGY IMAGES ====================

    /**
     * Upload technology profile image
     * POST /:username/images/technologies/:id/profile-image
     */
    async uploadTechnologyProfileImage(username: string, technologyId: number, file: File): Promise<Technology> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.post(
                `/${username}/images/technologies/${technologyId}/profile-image`,
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
     * GET /:username/images/technologies/:id/profile-image
     */
    getTechnologyProfileImageUrl(username: string, technologyId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/${username}/images/technologies/${technologyId}/profile-image`;
    },

    /**
     * Delete technology profile image
     * DELETE /:username/images/technologies/:id/profile-image
     */
    async deleteTechnologyProfileImage(username: string, technologyId: number): Promise<void> {
        try {
            await ApiService.delete(
                `/${username}/images/technologies/${technologyId}/profile-image`
            );
        } catch (error) {
            throw error;
        }
    },

    // ==================== USER PROFILE IMAGES ====================

    /**
     * Upload user profile image
     * POST /:username/images/users/:id/profile-image
     */
    async uploadUserProfileImage(username: string, userId: number, file: File): Promise<User> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.post(
                `/${username}/images/users/${userId}/profile-image`,
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
     * GET /:username/images/users/:id/profile-image
     */
    getUserProfileImageUrl(username: string, userId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/${username}/images/users/${userId}/profile-image`;
    },

    /**
     * Delete user profile image
     * DELETE /:username/images/users/:id/profile-image
     */
    async deleteUserProfileImage(username: string, userId: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/images/users/${userId}/profile-image`);
        } catch (error) {
            throw error;
        }
    },

    // ==================== USER CERTIFICATES IMAGES ====================

    /**
     * Upload certificate image
     * POST /:username/images/users/certificates/:certificateId/image
     */
    async uploadCertificateImage(username: string, certificateId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('certificateImage', file);

            const response = await ApiService.post(
                `/${username}/images/users/certificates/${certificateId}/image`,
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
     * GET /:username/images/users/certificates/:certificateId/image
     */
    getCertificateImageUrl(username: string, certificateId: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/${username}/images/users/certificates/${certificateId}/image`;
    },

    /**
     * Delete certificate image
     * DELETE /:username/images/users/certificates/:certificateId/image
     */
    async deleteCertificateImage(username: string, certificateId: number): Promise<void> {
        try {
            await ApiService.delete(
                `/${username}/images/users/certificates/${certificateId}/image`
            );
        } catch (error) {
            throw error;
        }
    },
};

