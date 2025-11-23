import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';
export declare class Conversation {
    id: number;
    userId: number;
    user?: User;
    senderName: string;
    senderEmail: string;
    messageCount: number;
    unreadCount: number;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    messages?: Message[];
}
