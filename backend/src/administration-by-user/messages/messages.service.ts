import { Repository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';
import { ConversationNotFoundException } from './exceptions/conversation-not-found.exception';

@Injectable()
export class MessagesService {
    constructor(
        private readonly usersService: UsersService,

        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,

        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
    ) { }

    /**
     * Creates or finds a conversation for a given sender email
     */
    async findOrCreateConversation(
        userId: number,
        senderName: string,
        senderEmail: string,
    ): Promise<Conversation> {
        // Normalize email to lowercase for consistent grouping
        const normalizedEmail = senderEmail.toLowerCase().trim();

        let conversation = await this.conversationRepository.findOne({
            where: {
                userId,
                senderEmail: normalizedEmail,
            },
        });

        if (!conversation) {
            conversation = this.conversationRepository.create({
                userId,
                senderName,
                senderEmail: normalizedEmail,
                messageCount: 0,
                unreadCount: 0,
            });
            conversation = await this.conversationRepository.save(conversation);
        } else {
            // Update sender name in case it changed
            if (conversation.senderName !== senderName) {
                conversation.senderName = senderName;
                await this.conversationRepository.save(conversation);
            }
        }

        return conversation;
    }

    /**
     * Creates a new message and associates it with a conversation
     */
    async create(username: string, createMessageDto: CreateMessageDto): Promise<Message> {
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
            throw new Error(`User with username '${username}' not found`);
        }

        // Find or create conversation
        const conversation = await this.findOrCreateConversation(
            user.id,
            createMessageDto.senderName,
            createMessageDto.senderEmail,
        );

        // Create message (normalize email to match conversation)
        const message = this.messageRepository.create({
            ...createMessageDto,
            senderEmail: createMessageDto.senderEmail.toLowerCase().trim(),
            userId: user.id,
            conversationId: conversation.id,
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update conversation statistics
        await this.updateConversationStats(conversation.id);

        return savedMessage;
    }

    /**
     * Updates conversation statistics (message count, unread count, last message date)
     */
    async updateConversationStats(conversationId: number): Promise<void> {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            return;
        }

        const [messages, unreadMessages] = await Promise.all([
            this.messageRepository.find({
                where: { conversationId },
                order: { createdAt: 'DESC' },
            }),
            this.messageRepository.find({
                where: {
                    conversationId,
                    readAt: null,
                },
            }),
        ]);

        const lastMessage = messages[0];

        conversation.messageCount = messages.length;
        conversation.unreadCount = unreadMessages.length;
        conversation.lastMessageAt = lastMessage?.createdAt;

        await this.conversationRepository.save(conversation);
    }

    /**
     * Lists all conversations for a user, ordered by last message date
     */
    async findAllConversations(username: string): Promise<Conversation[]> {
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
            throw new Error(`User with username '${username}' not found`);
        }

        const conversations = await this.conversationRepository.find({
            where: { userId: user.id },
            order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
        });

        if (conversations.length === 0) {
            return conversations;
        }

        // Get all conversation IDs
        const conversationIds = conversations.map(c => c.id);

        // Get unread counts for all conversations in a single query
        // Count only messages with readAt = null and not soft deleted
        const unreadCounts = await this.messageRepository
            .createQueryBuilder('message')
            .select('message.conversationId', 'conversationId')
            .addSelect('COUNT(message.id)', 'count')
            .where('message.conversationId IN (:...conversationIds)', { conversationIds })
            .andWhere('message.readAt IS NULL')
            .andWhere('message.deletedAt IS NULL')
            .groupBy('message.conversationId')
            .getRawMany();

        // Create a map of conversationId -> unreadCount
        const unreadCountMap = new Map<number, number>();
        unreadCounts.forEach((item: { conversationId: number; count: string }) => {
            unreadCountMap.set(item.conversationId, parseInt(item.count, 10));
        });

        // Update unreadCount for each conversation
        conversations.forEach(conversation => {
            conversation.unreadCount = unreadCountMap.get(conversation.id) || 0;
        });

        return conversations;
    }

    /**
     * Gets the last message from a conversation (for preview)
     */
    async getLastMessagePreview(conversationId: number): Promise<string | undefined> {
        const lastMessage = await this.messageRepository.findOne({
            where: { conversationId },
            order: { createdAt: 'DESC' },
            select: ['message'],
        });

        if (!lastMessage) {
            return undefined;
        }

        return lastMessage.message.length > 100
            ? lastMessage.message.substring(0, 100) + '...'
            : lastMessage.message;
    }

    /**
     * Finds a conversation by ID
     */
    async findConversationById(id: number, username: string): Promise<Conversation> {
        const user = await this.usersService.findOneBy({ username });

        if (!user) {
            throw new Error(`User with username '${username}' not found`);
        }

        const conversation = await this.conversationRepository.findOne({
            where: { id, userId: user.id },
        });

        if (!conversation) {
            throw new ConversationNotFoundException();
        }

        return conversation;
    }

    /**
     * Gets all messages from a specific conversation
     */
    async findMessagesByConversation(
        conversationId: number,
        username: string,
    ): Promise<Message[]> {
        await this.findConversationById(conversationId, username);

        return await this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * Marks messages as read
     */
    async markMessagesAsRead(
        conversationId: number,
        username: string,
        messageIds: number[],
    ): Promise<void> {
        await this.findConversationById(conversationId, username);

        const readAtDate = new Date();

        const result = await this.messageRepository
            .createQueryBuilder()
            .update(Message)
            .set({ readAt: readAtDate })
            .where('conversationId = :conversationId', { conversationId })
            .andWhere('readAt IS NULL')
            .andWhere('id IN (:...messageIds)', { messageIds })
            .execute();

        // Update conversation statistics only if messages were updated
        if (result.affected && result.affected > 0) {
            await this.updateConversationStats(conversationId);
        }
    }

    /**
     * Lists all messages (legacy method, kept for backward compatibility)
     */
    async findAll(username: string): Promise<Message[]> {
        return await this.messageRepository.find({
            where: { user: { username } },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Finds a message by ID
     */
    async findById(id: number, username: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { id, user: { username } },
            relations: ['user', 'conversation'],
        });

        if (!message) {
            throw new MessageNotFoundException();
        }

        return message;
    }

    /**
     * Deletes a message (soft delete)
     */
    async delete(id: number, username: string): Promise<void> {
        const message = await this.findById(id, username);
        await this.messageRepository.softDelete(id);

        // Update conversation statistics if message had a conversation
        if (message.conversationId) {
            await this.updateConversationStats(message.conversationId);
        }
    }
}

