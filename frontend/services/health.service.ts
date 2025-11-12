import { ApiService } from "./api.service";

export interface HealthStatus {
    status: string;
    info: Record<string, any>;
    error: Record<string, any>;
    details: Record<string, any>;
}

export const HealthService = {
    /**
     * Get application health status
     * GET /health
     */
    async checkHealth(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health');
            return response.data.data || response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application readiness status
     * GET /health/ready
     */
    async checkReadiness(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health/ready');
            return response.data.data || response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get application liveness status
     * GET /health/live
     */
    async checkLiveness(): Promise<HealthStatus> {
        try {
            const response = await ApiService.get('/health/live');
            return response.data.data || response.data;
        } catch (error) {
            throw error;
        }
    },
};
