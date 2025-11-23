import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAllConversations(username: string): Promise<ConversationResponseDto[]>;
    findMessagesByConversation(username: string, conversationId: number): Promise<Message[]>;
    markMessagesAsRead(username: string, conversationId: number, markMessagesReadDto: MarkMessagesReadDto): Promise<void>;
    findAll(username: string): Promise<Message[]>;
    findById(username: string, id: number): Promise<Message>;
    delete(username: string, id: number): Promise<void>;
}
