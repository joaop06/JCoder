import { Conversation } from '../entities/conversation.entity';
export declare class ConversationResponseDto {
    id: number;
    senderName: string;
    senderEmail: string;
    messageCount: number;
    unreadCount: number;
    lastMessagePreview?: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(conversation: Conversation, lastMessagePreview?: string): ConversationResponseDto;
}
