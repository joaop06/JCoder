export interface Message {
    id: number;
    userId: number;
    senderName: string;
    senderEmail: string;
    message: string;
    conversationId?: number;
    readAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string;
}

