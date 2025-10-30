import ApiService from "./api.service";
import { UserComponentAboutMe } from "@/types/entities/user-component-about-me.entity";
import { UserComponentEducation } from "@/types/entities/user-component-education.entity";
import { UserComponentExperience } from "@/types/entities/user-component-experience.entity";
import { UserComponentCertificate } from "@/types/entities/user-component-certificate.entity";

export const UserComponentsService = {
    // ==================== ABOUT ME METHODS ====================

    async getAboutMe(): Promise<UserComponentAboutMe | null> {
        try {
            const response = await ApiService.get('/users/profile/about-me');
            return response.data.data || response.data;
        } catch (error) {
            return null;
        }
    },

    async createOrUpdateAboutMe(data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        const response = await ApiService.post('/users/profile/about-me', data);
        return response.data.data || response.data;
    },

    async updateAboutMe(data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        const response = await ApiService.patch('/users/profile/about-me', data);
        return response.data.data || response.data;
    },

    // ==================== EDUCATION METHODS ====================

    async getEducations(): Promise<UserComponentEducation[]> {
        try {
            const response = await ApiService.get('/users/profile/educations');
            const data = response.data.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching educations:', error);
            return [];
        }
    },

    async getEducation(id: number): Promise<UserComponentEducation> {
        const response = await ApiService.get(`/users/profile/educations/${id}`);
        return response.data.data || response.data;
    },

    async createEducation(data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        const response = await ApiService.post('/users/profile/educations', data);
        return response.data.data || response.data;
    },

    async updateEducation(id: number, data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        const response = await ApiService.put(`/users/profile/educations/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteEducation(id: number): Promise<void> {
        await ApiService.delete(`/users/profile/educations/${id}`);
    },

    // ==================== EXPERIENCE METHODS ====================

    async getExperiences(): Promise<UserComponentExperience[]> {
        try {
            const response = await ApiService.get('/users/profile/experiences');
            const data = response.data.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching experiences:', error);
            return [];
        }
    },

    async getExperience(id: number): Promise<UserComponentExperience> {
        const response = await ApiService.get(`/users/profile/experiences/${id}`);
        return response.data.data || response.data;
    },

    async createExperience(data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        const response = await ApiService.post('/users/profile/experiences', data);
        return response.data.data || response.data;
    },

    async updateExperience(id: number, data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        const response = await ApiService.put(`/users/profile/experiences/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteExperience(id: number): Promise<void> {
        await ApiService.delete(`/users/profile/experiences/${id}`);
    },

    // ==================== CERTIFICATE METHODS ====================

    async getCertificates(): Promise<UserComponentCertificate[]> {
        try {
            const response = await ApiService.get('/users/profile/certificates');
            const data = response.data.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching certificates:', error);
            return [];
        }
    },

    async getCertificate(id: number): Promise<UserComponentCertificate> {
        const response = await ApiService.get(`/users/profile/certificates/${id}`);
        return response.data.data || response.data;
    },

    async createCertificate(data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        const response = await ApiService.post('/users/profile/certificates', data);
        return response.data.data || response.data;
    },

    async updateCertificate(id: number, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        const response = await ApiService.put(`/users/profile/certificates/${id}`, data);
        return response.data.data || response.data;
    },

    async deleteCertificate(id: number): Promise<void> {
        await ApiService.delete(`/users/profile/certificates/${id}`);
    },
};

