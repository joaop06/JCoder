import {
    User,
    Technology,
    Application,
    CreateUserDto,
    PaginationDto,
    PaginatedResponseDto,
    UserComponentAboutMe,
    UserComponentEducation,
    UserComponentExperience,
    UserComponentCertificate,
    UserComponentReference,
} from "@/types";
import { ApiService } from "../api.service";

export const PortfolioViewService = {
    /**
     * Fetches basic profile data with About Me
     * Optimized route for initial portfolio loading
     * GET /portfolio/:username/profile
     */
    async getProfileWithAboutMe(username: string): Promise<User> {
        try {
            const response = await ApiService.get(`/portfolio/${username}/profile`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetches user educations
     * On-demand loading for better mobile performance
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
     * Fetches user experiences
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
     * Fetches user certificates
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
     * Fetches user references
     * GET /portfolio/:username/references
     */
    async getReferences(username: string, pagination: PaginationDto = {}): Promise<PaginatedResponseDto<UserComponentReference>> {
        try {
            const params = new URLSearchParams();
            if (pagination.page) params.append('page', pagination.page.toString());
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
            if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

            const queryString = params.toString();
            const url = `/portfolio/${username}/references${queryString ? `?${queryString}` : ''}`;
            const response = await ApiService.get(url);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetches all user applications (without components)
     * Optimized listing for performance
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
     * Fetches details of a specific application (with components)
     * On-demand loading when user clicks on an application
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
     * Fetches user technologies
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
     * Checks username availability
     * Used for real-time validation during registration
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
     * Checks email availability
     * Used for real-time validation during registration
     * GET /portfolio/check-email/:email
     */
    async checkEmailAvailability(email: string): Promise<{ available: boolean; email: string }> {
        try {
            const response = await ApiService.get(`/portfolio/check-email/${encodeURIComponent(email)}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Sends a message to the portfolio administrator
     * Public endpoint for regular users to send messages
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

    /**
     * Registration of new administrator user
     * Allows new users to create their accounts and start managing their portfolios
     * POST /portfolio/register
     */
    async register(createUserDto: CreateUserDto): Promise<User> {
        try {
            const response = await ApiService.post('/portfolio/register', createUserDto);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Sends verification code to email
     * POST /portfolio/send-email-verification
     */
    async sendEmailVerification(email: string): Promise<{ message: string }> {
        try {
            const response = await ApiService.post('/portfolio/send-email-verification', { email });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verifies email verification code
     * POST /portfolio/verify-email-code
     */
    async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean; message: string }> {
        try {
            const response = await ApiService.post('/portfolio/verify-email-code', { email, code });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
};

// Re-export tracking service
export { PortfolioTrackingService } from './portfolio-tracking.service';
