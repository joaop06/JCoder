import axios from 'axios';

// Configuração base da API
const ApiService = axios.create({
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});

// Interceptor para adicionar o token JWT nas requisições
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

// Interceptor para tratar respostas e erros
ApiService.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default ApiService;
