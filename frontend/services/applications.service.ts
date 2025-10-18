import ApiService from "./api.service";
import { Application } from "@/types/entities/application.entity";
import { CreateApplicationDto } from "@/types/entities/dtos/create-application.dto";
import { UpdateApplicationDto } from "@/types/entities/dtos/update-application.dto";
import { PaginationDto, PaginatedResponse, ApiResponse } from "@/types/api/pagination.type";

export const ApplicationService = {
    async getAll(): Promise<Application[]> {
        try {
            const response = await ApiService.get('/applications');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async getAllPaginated(pagination: PaginationDto = {}): Promise<PaginatedResponse<Application>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const response = await ApiService.get(`/applications/paginated?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number): Promise<Application> {
        try {
            const response = await ApiService.get(`/applications/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async create(payload: CreateApplicationDto): Promise<Application> {
        try {
            const response = await ApiService.post(`/applications`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async update(id: number, payload: UpdateApplicationDto): Promise<Application> {
        try {
            const response = await ApiService.put(`/applications/${id}`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await ApiService.delete(`/applications/${id}`);
        } catch (error) {
            throw error;
        }
    },

    async uploadImages(id: number, files: File[]): Promise<Application> {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images', file);
            });

            const response = await ApiService.post(`/applications/${id}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteImage(id: number, filename: string): Promise<void> {
        try {
            await ApiService.delete(`/applications/${id}/images/${filename}`);
        } catch (error) {
            throw error;
        }
    },

    getImageUrl(id: number, filename: string): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8081'}/api/v1/applications/${id}/images/${filename}`;
    },

    // Profile Image Methods
    async uploadProfileImage(id: number, file: File): Promise<Application> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.post(`/applications/${id}/profile-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async updateProfileImage(id: number, file: File): Promise<Application> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiService.put(`/applications/${id}/profile-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteProfileImage(id: number): Promise<void> {
        try {
            await ApiService.delete(`/applications/${id}/profile-image`);
        } catch (error) {
            throw error;
        }
    },

    getProfileImageUrl(id: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8081'}/api/v1/applications/${id}/profile-image`;
    },
};
