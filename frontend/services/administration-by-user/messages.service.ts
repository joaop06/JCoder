import { Message, ConversationResponseDto, MarkMessagesReadDto } from '@/types/api/messages';
import { ApiService } from '../api.service';

export const MessagesService = {
    /**
     * Get all conversations (grouped by sender)
     * GET /:username/messages/conversations
     */
    async findAllConversations(username: string): Promise<ConversationResponseDto[]> {
        try {
            const response = await ApiService.get(`/${username}/messages/conversations`);
            // API returns { data: [...], success: true, ... }
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all messages from a specific conversation
     * GET /:username/messages/conversations/:conversationId/messages
     */
    async findMessagesByConversation(username: string, conversationId: number): Promise<Message[]> {
        try {
            const response = await ApiService.get(`/${username}/messages/conversations/${conversationId}/messages`);
            // API returns { data: [...], success: true, ... }
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mark messages as read in a conversation
     * POST /:username/messages/conversations/:conversationId/mark-read
     */
    async markMessagesAsRead(
        username: string,
        conversationId: number,
        data: MarkMessagesReadDto,
    ): Promise<void> {
        try {
            await ApiService.post(`/${username}/messages/conversations/${conversationId}/mark-read`, data);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a specific message by ID
     * GET /:username/messages/:id
     */
    async findById(username: string, id: number): Promise<Message> {
        try {
            const response = await ApiService.get(`/${username}/messages/${id}`);
            // API returns { data: {...}, success: true, ... }
            return response.data?.data || response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a message (soft delete)
     * DELETE /:username/messages/:id
     */
    async delete(username: string, id: number): Promise<void> {
        try {
            await ApiService.delete(`/${username}/messages/${id}`);
        } catch (error) {
            throw error;
        }
    },
};

