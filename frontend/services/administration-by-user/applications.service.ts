import { ApiService } from "./api.service";
import { Application } from "@/types/entities/application.entity";
import { PaginationDto, PaginatedResponse } from "@/types/api/pagination.type";
import { CreateApplicationDto } from "@/types/entities/dtos/create-application.dto";
import { UpdateApplicationDto } from "@/types/entities/dtos/update-application.dto";

export const ApplicationService = {
    /**
     * Get all applications with pagination
     * GET /:username/applications
     */
    async findAll(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponse<Application>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/${username}/applications${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application by ID
     * GET /:username/applications/:id
     */
    async getById(username: string, id: number): Promise<Application> {
        try {
            const response = await ApiService.get(`/${username}/applications/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new application
     * POST /:username/applications
     */
    async create(username: string, payload: CreateApplicationDto): Promise<Application> {
        try {
            const response = await ApiService.post(`/${username}/applications`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update an application
     * PUT /:username/applications/:id
     */
    async update(username: string, id: number, payload: UpdateApplicationDto): Promise<Application> {
        try {
            const response = await ApiService.put(`/${username}/applications/${id}`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete an application
     * DELETE /:username/applications/:id
     */
    async delete(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/applications/${id}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reorder an application
     * PUT /:username/applications/:id/reorder
     */
    async reorder(username: string, id: number, displayOrder: number): Promise<Application> {
        try {
            const response = await ApiService.put(`/${username}/applications/${id}/reorder`, {
                displayOrder,
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get applications statistics
     * GET /:username/applications/stats
     */
    async getStats(username: string): Promise<{ active: number; inactive: number; total: number }> {
        try {
            const response = await ApiService.get(`/${username}/applications/stats`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
};
