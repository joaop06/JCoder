import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private readonly usersService;
    private readonly messageRepository;
    private readonly conversationRepository;
    constructor(usersService: UsersService, messageRepository: Repository<Message>, conversationRepository: Repository<Conversation>);
    findOrCreateConversation(userId: number, senderName: string, senderEmail: string): Promise<Conversation>;
    create(username: string, createMessageDto: CreateMessageDto): Promise<Message>;
    updateConversationStats(conversationId: number): Promise<void>;
    findAllConversations(username: string): Promise<Conversation[]>;
    getLastMessagePreview(conversationId: number): Promise<string | undefined>;
    findConversationById(id: number, username: string): Promise<Conversation>;
    findMessagesByConversation(conversationId: number, username: string): Promise<Message[]>;
    markMessagesAsRead(conversationId: number, username: string, messageIds: number[]): Promise<void>;
    findAll(username: string): Promise<Message[]>;
    findById(id: number, username: string): Promise<Message>;
    delete(id: number, username: string): Promise<void>;
}
