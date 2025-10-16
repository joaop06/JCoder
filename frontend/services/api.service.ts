import axios from 'axios';

// Base configuration from API
const ApiService = axios.create({
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1`,
});

// Interceptor for add the JWT on requests
ApiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor for handling responses and errors
ApiService.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
    },
    (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default ApiService;
