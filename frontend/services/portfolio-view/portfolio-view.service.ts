import {
    User,
    Technology,
    Application,
    PaginationDto,
    PaginatedResponseDto,
    UserComponentAboutMe,
    UserComponentEducation,
    UserComponentExperience,
    UserComponentCertificate,
} from "@/types";
import { ApiService } from "../api.service";

export const PortfolioViewService = {
    /**
     * Busca dados básicos do perfil com About Me
     * Rota otimizada para carregamento inicial do portfólio
     * GET /portfolio/:username/profile
     */
    async getProfileWithAboutMe(username: string): Promise<User & { aboutMe?: UserComponentAboutMe }> {
        try {
            const response = await ApiService.get(`/portfolio/${username}/profile`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca educações do usuário
     * Carregamento sob demanda para melhor performance mobile
     * GET /portfolio/:username/educations
     */
    async getEducations(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<UserComponentEducation>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/educations${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca experiências do usuário
     * GET /portfolio/:username/experiences
     */
    async getExperiences(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<UserComponentExperience>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/experiences${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca certificados do usuário
     * GET /portfolio/:username/certificates
     */
    async getCertificates(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/certificates${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca todas as aplicações do usuário (sem componentes)
     * Listagem otimizada para performance
     * GET /portfolio/:username/applications
     */
    async getApplications(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<Application>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/applications${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca detalhes de uma aplicação específica (com componentes)
     * Carregamento sob demanda quando usuário clica em uma aplicação
     * GET /portfolio/:username/applications/:id
     */
    async getApplicationDetails(username: string, id: number): Promise<Application> {
        try {
            const response = await ApiService.get(`/portfolio/${username}/applications/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Busca tecnologias do usuário
     * GET /portfolio/:username/technologies
     */
    async getTechnologies(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<Technology>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/technologies${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verifica disponibilidade do username
     * Usado para validação em tempo real durante o cadastro
     * GET /portfolio/check-username/:username
     */
    async checkUsernameAvailability(username: string): Promise<{ available: boolean; username: string }> {
        try {
            const response = await ApiService.get(`/portfolio/check-username/${username}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Envia uma mensagem ao administrador do portfólio
     * Endpoint público para usuários comuns enviarem mensagens
     * POST /portfolio/:username/messages
     */
    async createMessage(
        username: string,
        data: {
            senderName: string;
            senderEmail: string;
            message: string;
        }
    ): Promise<void> {
        try {
            await ApiService.post(`/portfolio/${username}/messages`, data);
        } catch (error) {
            throw error;
        }
    },
};
