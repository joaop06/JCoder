export interface ApplicationComponentApi {
    applicationId: number;
    domain: string;
    apiUrl: string;
    documentationUrl: string;
    healthCheckEndpoint?: string;
};
