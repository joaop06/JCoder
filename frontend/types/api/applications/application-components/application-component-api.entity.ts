export interface ApplicationComponentApi {
    userId?: number;
    applicationId?: number;

    domain: string;
    apiUrl: string;
    documentationUrl?: string;
    healthCheckEndpoint?: string;
};
