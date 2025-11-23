import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';
export declare class Message {
    id: number;
    userId: number;
    user?: User;
    senderName: string;
    senderEmail: string;
    message: string;
    conversationId?: number;
    conversation?: Conversation;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
