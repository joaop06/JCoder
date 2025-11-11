import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from '../entities/conversation.entity';

export class ConversationResponseDto {
    @ApiProperty({
        type: 'number',
        example: 1,
        description: 'Conversation ID',
    })
    id: number;

    @ApiProperty({
        type: 'string',
        example: 'João Silva',
        description: 'Sender name',
    })
    senderName: string;

    @ApiProperty({
        type: 'string',
        example: 'joao@example.com',
        description: 'Sender email',
    })
    senderEmail: string;

    @ApiProperty({
        type: 'number',
        example: 5,
        description: 'Total number of messages',
    })
    messageCount: number;

    @ApiProperty({
        type: 'number',
        example: 2,
        description: 'Number of unread messages',
    })
    unreadCount: number;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'Hello! I would like to get in touch...',
        description: 'Preview of the last message',
    })
    lastMessagePreview?: string;

    @ApiProperty({
        type: () => Date,
        nullable: true,
        description: 'Date of the last message',
    })
    lastMessageAt?: Date;

    @ApiProperty({
        type: () => Date,
        description: 'Conversation creation date',
    })
    createdAt: Date;

    @ApiProperty({
        type: () => Date,
        description: 'Last update date',
    })
    updatedAt: Date;

    static fromEntity(conversation: Conversation, lastMessagePreview?: string): ConversationResponseDto {
        return {
            id: conversation.id,
            senderName: conversation.senderName,
            senderEmail: conversation.senderEmail,
            messageCount: conversation.messageCount,
            unreadCount: conversation.unreadCount,
            lastMessagePreview,
            lastMessageAt: conversation.lastMessageAt,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
}

