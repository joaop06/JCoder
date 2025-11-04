import { ApiService } from './api.service';
import { Technology } from '@/types/entities/technology.entity';
import { CreateTechnologyDto } from '@/types/entities/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/entities/dtos/update-technology.dto';
import { ReorderTechnologyDto } from '@/types/entities/dtos/reorder-technology.dto';
import { PaginationDto, PaginatedResponse } from '@/types/api/pagination.type';

export const TechnologiesService = {
    /**
     * Get all technologies with pagination
     * GET /:username/technologies
     */
    async findAll(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponse<Technology>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/${username}/technologies${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get technology by ID
     * GET /:username/technologies/:id
     */
    async getById(username: string, id: number): Promise<Technology> {
        try {
            const response = await ApiService.get(`/${username}/technologies/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new technology
     * POST /:username/technologies
     */
    async create(username: string, payload: CreateTechnologyDto): Promise<Technology> {
        try {
            const response = await ApiService.post(`/${username}/technologies`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update a technology
     * PUT /:username/technologies/:id
     */
    async update(username: string, id: number, payload: UpdateTechnologyDto): Promise<Technology> {
        try {
            const response = await ApiService.put(`/${username}/technologies/${id}`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a technology
     * DELETE /:username/technologies/:id
     */
    async delete(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/technologies/${id}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reorder technology
     * PUT /:username/technologies/:id/reorder
     */
    async reorder(username: string, id: number, displayOrder: number): Promise<Technology> {
        try {
            const payload: ReorderTechnologyDto = { displayOrder };
            const response = await ApiService.put(`/${username}/technologies/${id}/reorder`, payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get technologies statistics
     * GET /:username/technologies/stats
     */
    async getStats(username: string): Promise<{ active: number; inactive: number; total: number }> {
        try {
            const response = await ApiService.get(`/${username}/technologies/stats`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
};

