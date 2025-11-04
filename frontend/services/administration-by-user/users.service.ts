import { ApiService } from "./api.service";
import { User } from "@/types/entities/user.entity";
import { UserComponentAboutMe } from "@/types/entities/user-component-about-me.entity";
import { UserComponentEducation } from "@/types/entities/user-component-education.entity";
import { UserComponentExperience } from "@/types/entities/user-component-experience.entity";
import { UserComponentCertificate } from "@/types/entities/user-component-certificate.entity";
import { PaginationDto, PaginatedResponse } from "@/types/api/pagination.type";

export const UsersService = {
    // ==================== STORAGE HELPERS ====================

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

    /**
     * Get public user profile data (for homepage/resume)
     * @returns User data with public information (email, fullName, githubUrl, linkedinUrl)
     */
    async getPublicProfile(): Promise<User | null> {
        try {
            // Try public endpoint first
            const response = await ApiService.get('/users/public/profile');
            return response.data.data || response.data;
        } catch (error) {
            // Fallback to localStorage if public endpoint fails
            console.warn('Public profile endpoint not available, using localStorage data:', error);
            return this.getUserStorage();
        }
    },

    // ==================== PROFILE ENDPOINTS ====================

    /**
     * Get user profile
     * GET /:username/users/profile
     */
    async getProfile(username: string): Promise<User> {
        try {
            const response = await ApiService.get(`/${username}/users/profile`);
            const updatedUser = response.data.data;
            
            // Update local storage with new user data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return updatedUser;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user profile
     * PATCH /:username/users/profile
     */
    async updateProfile(username: string, data: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<User> {
        try {
            const response = await ApiService.patch(`/${username}/users/profile`, data);
            const updatedUser = response.data.data;

            // Update local storage with new user data
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            throw error;
        }
    },

    // ==================== ABOUT ME ENDPOINTS ====================

    /**
     * Get about me
     * GET /:username/users/about-me
     */
    async getAboutMe(username: string): Promise<UserComponentAboutMe> {
        try {
            const response = await ApiService.get(`/${username}/users/about-me`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update about me
     * PATCH /:username/users/about-me
     */
    async updateAboutMe(username: string, data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        try {
            const response = await ApiService.patch(`/${username}/users/about-me`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== EDUCATION ENDPOINTS ====================

    /**
     * Get educations
     * GET /:username/users/educations
     */
    async getEducations(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponse<UserComponentEducation>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/${username}/users/educations${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create education
     * POST /:username/users/educations
     */
    async createEducation(username: string, data: Omit<UserComponentEducation, 'id' | 'userId'>): Promise<UserComponentEducation> {
        try {
            const response = await ApiService.post(`/${username}/users/educations`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update education
     * PUT /:username/users/educations/:id
     */
    async updateEducation(username: string, id: number, data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        try {
            const response = await ApiService.put(`/${username}/users/educations/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete education
     * DELETE /:username/users/educations/:id
     */
    async deleteEducation(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/users/educations/${id}`);
        } catch (error) {
            throw error;
        }
    },

    // ==================== EXPERIENCE ENDPOINTS ====================

    /**
     * Get experiences
     * GET /:username/users/experiences
     */
    async getExperiences(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponse<UserComponentExperience>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/${username}/users/experiences${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create experience
     * POST /:username/users/experiences
     */
    async createExperience(username: string, data: Omit<UserComponentExperience, 'userId'>): Promise<UserComponentExperience> {
        try {
            const response = await ApiService.post(`/${username}/users/experiences`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update experience
     * PUT /:username/users/experiences/:id
     */
    async updateExperience(username: string, id: number, data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        try {
            const response = await ApiService.put(`/${username}/users/experiences/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete experience
     * DELETE /:username/users/experiences/:id
     */
    async deleteExperience(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/users/experiences/${id}`);
        } catch (error) {
            throw error;
        }
    },

    // ==================== CERTIFICATE ENDPOINTS ====================

    /**
     * Get certificates
     * GET /:username/users/certificates
     */
    async getCertificates(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponse<UserComponentCertificate>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/${username}/users/certificates${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create certificate
     * POST /:username/users/certificates
     */
    async createCertificate(username: string, data: Omit<UserComponentCertificate, 'id' | 'userId' | 'educations'>): Promise<UserComponentCertificate> {
        try {
            const response = await ApiService.post(`/${username}/users/certificates`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update certificate
     * PUT /:username/users/certificates/:id
     */
    async updateCertificate(username: string, id: number, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        try {
            const response = await ApiService.put(`/${username}/users/certificates/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete certificate
     * DELETE /:username/users/certificates/:id
     */
    async deleteCertificate(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/users/certificates/${id}`);
        } catch (error) {
            throw error;
        }
    },

    // ==================== CERTIFICATE-EDUCATION LINK ENDPOINTS ====================

    /**
     * Link certificate to education
     * POST /:username/users/certificates/:certificateId/link-education/:educationId
     */
    async linkCertificateToEducation(username: string, certificateId: number, educationId: number): Promise<void> {
        try {
            await ApiService.post(`/${username}/users/certificates/${certificateId}/link-education/${educationId}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Unlink certificate from education
     * DELETE /:username/users/certificates/:certificateId/unlink-education/:educationId
     */
    async unlinkCertificateFromEducation(username: string, certificateId: number, educationId: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/users/certificates/${certificateId}/unlink-education/${educationId}`);
        } catch (error) {
            throw error;
        }
    },
};
