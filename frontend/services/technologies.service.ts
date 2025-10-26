import ApiService, { ApiServiceWithRetry } from './api.service';
import { Technology } from '@/types/entities/technology.entity';
import { CreateTechnologyDto } from '@/types/entities/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/entities/dtos/update-technology.dto';
import { PaginationDto, PaginatedResponse } from '@/types/api/pagination.type';
import { TechnologyCategoryEnum } from '@/types/enums/technology-category.enum';

export interface QueryTechnologiesDto extends PaginationDto {
    category?: TechnologyCategoryEnum;
    isActive?: boolean;
}

export const TechnologiesService = {
    /**
     * Get all technologies
     */
    async getAll(): Promise<Technology[]> {
        try {
            const response = await ApiServiceWithRetry.get('/technologies');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get technologies with pagination
     */
    async getAllPaginated(
        pagination: PaginationDto = {},
    ): Promise<PaginatedResponse<Technology>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit)
                params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder)
                params.append('sortOrder', pagination.sortOrder);

            const response = await ApiServiceWithRetry.get(
                `/technologies/paginated?${params.toString()}`,
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Query technologies with filters
     */
    async query(
        queryDto: QueryTechnologiesDto = {},
    ): Promise<PaginatedResponse<Technology>> {
        try {
            const params = new URLSearchParams();
            if (queryDto.page) params.append('page', queryDto.page.toString());
            if (queryDto.limit) params.append('limit', queryDto.limit.toString());
            if (queryDto.sortBy) params.append('sortBy', queryDto.sortBy);
            if (queryDto.sortOrder) params.append('sortOrder', queryDto.sortOrder);
            if (queryDto.category) params.append('category', queryDto.category);
            if (queryDto.isActive !== undefined)
                params.append('isActive', queryDto.isActive.toString());

            const response = await ApiServiceWithRetry.get(
                `/technologies/query?${params.toString()}`,
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get technology by ID
     */
    async getById(id: number): Promise<Technology> {
        try {
            const response = await ApiServiceWithRetry.get(`/technologies/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new technology (Admin only)
     */
    async create(payload: CreateTechnologyDto): Promise<Technology> {
        try {
            const response = await ApiServiceWithRetry.post(
                '/technologies',
                payload,
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update a technology (Admin only)
     */
    async update(
        id: number,
        payload: UpdateTechnologyDto,
    ): Promise<Technology> {
        try {
            const response = await ApiServiceWithRetry.put(
                `/technologies/${id}`,
                payload,
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a technology (Admin only)
     */
    async delete(id: number): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(`/technologies/${id}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload profile image (Admin only)
     */
    async uploadProfileImage(id: number, file: File): Promise<Technology> {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await ApiServiceWithRetry.post(
                `/technologies/${id}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete profile image (Admin only)
     */
    async deleteProfileImage(id: number): Promise<void> {
        try {
            await ApiServiceWithRetry.delete(`/technologies/${id}/profile-image`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get profile image URL
     */
    getProfileImageUrl(id: number): string {
        return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8081'}/api/v1/technologies/${id}/profile-image`;
    },
};

