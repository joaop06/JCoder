import ApiService from "./api.service";

export interface HealthStatus {
    status: string;
    info: Record<string, any>;
    error: Record<string, any>;
    details: Record<string, any>;
}

export const HealthService = {
    async checkHealth(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async checkReadiness(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health/ready');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    async checkLiveness(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health/live');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
};
