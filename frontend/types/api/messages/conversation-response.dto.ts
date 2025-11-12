export interface ConversationResponseDto {
    id: number;
    senderName: string;
    senderEmail: string;
    messageCount: number;
    unreadCount: number;
    lastMessagePreview?: string;
    lastMessageAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

