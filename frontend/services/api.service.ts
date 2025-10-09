import axios from 'axios';

// Base configuration from API
const ApiService = axios.create({
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
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
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default ApiService;
