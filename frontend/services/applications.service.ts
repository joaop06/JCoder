import ApiService from "./api.service";
import { Application } from "@/types/entities/application.entity";
import { CreateApplicationDto } from "@/types/entities/dtos/create-application.dto";

export const ApplicationService = {
    async getAll(): Promise<Application[]> {
        try {
            const response = await ApiService.get('/applications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number): Promise<Application> {
        try {
            const response = await ApiService.get(`/applications/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async create(payload: CreateApplicationDto): Promise<Application> {
        try {
            const response = await ApiService.post(`/applications`, payload);
            return response.data;
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
};
