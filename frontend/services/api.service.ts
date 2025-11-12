import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Retry configuration
interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    retries: 3,
    retryDelay: 1000, // 1 second
    retryCondition: (error: AxiosError) => {
        // Retry on network errors, timeouts, and 5xx server errors
        return !error.response ||
            error.code === 'ECONNABORTED' ||
            error.code === 'NETWORK_ERROR' ||
            (error.response.status >= 500 && error.response.status < 600);
    }
};

// Base configuration from API
const AxiosInstance = axios.create({
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1`,
});

// Interceptor for add the JWT on requests
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Remove Content-Type header for FormData - let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Retry function with exponential backoff
const retryRequest = async (
    config: AxiosRequestConfig,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<AxiosResponse> => {
    let lastError: AxiosError;

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
        try {
            const response = await AxiosInstance(config);
            if (attempt > 0 && process.env.NODE_ENV === 'development') {
                console.log(`🔄 Retry successful on attempt ${attempt + 1} for ${config.method?.toUpperCase()} ${config.url}`);
            }
            return response;
        } catch (error) {
            lastError = error as AxiosError;

            // Don't retry on the last attempt
            if (attempt === retryConfig.retries) {
                break;
            }

            // Check if we should retry this error
            if (!retryConfig.retryCondition || !retryConfig.retryCondition(lastError)) {
                break;
            }

            // Calculate delay with exponential backoff and jitter
            const baseDelay = retryConfig.retryDelay * Math.pow(2, attempt);
            const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
            const delay = baseDelay + jitter;

            if (process.env.NODE_ENV === 'development') {
                console.warn(`🔄 Retry attempt ${attempt + 1}/${retryConfig.retries} for ${config.method?.toUpperCase()} ${config.url} in ${Math.round(delay)}ms`);
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

// Interceptor for handling responses and errors
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ ${error?.config?.method?.toUpperCase()} ${error?.config?.url} - ${error?.response?.status || 'Network Error'}`);
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            // Only redirect to sign-in if it's NOT a public route
            const url = error.config?.url || '';
            const isPublicRoute = url.includes('/public/');

            if (!isPublicRoute) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/sign-in';
            }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded. Please try again later.');
        }

        return Promise.reject(error);
    }
);

// Enhanced API service with retry capability
export const ApiService = {
    get: (url: string, config?: AxiosRequestConfig, retryConfig?: RetryConfig) =>
        retryRequest({ ...config, method: 'GET', url }, retryConfig),

    post: (url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) =>
        retryRequest({ ...config, method: 'POST', url, data }, retryConfig),

    put: (url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) =>
        retryRequest({ ...config, method: 'PUT', url, data }, retryConfig),

    patch: (url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) =>
        retryRequest({ ...config, method: 'PATCH', url, data }, retryConfig),

    delete: (url: string, config?: AxiosRequestConfig, retryConfig?: RetryConfig) =>
        retryRequest({ ...config, method: 'DELETE', url }, retryConfig),
};
