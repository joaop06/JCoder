export interface ApplicationComponentApi {
    applicationId: number;
    username: string;
    domain: string;
    apiUrl: string;
    documentationUrl?: string;
    healthCheckEndpoint?: string;
};
