import ApiService from "./api.service";
import { Application } from "@/types/entities/application.entity";

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
    }
};
