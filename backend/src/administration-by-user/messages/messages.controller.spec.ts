import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';
import { ConversationNotFoundException } from './exceptions/conversation-not-found.exception';

// Mock das entidades para evitar dependências circulares
jest.mock('./entities/message.entity', () => ({
    Message: class Message {},
}));

jest.mock('./entities/conversation.entity', () => ({
    Conversation: class Conversation {},
}));

jest.mock('../users/entities/user.entity', () => ({
    User: class User {},
}));

// Mock do serviço antes de importar para evitar dependências circulares
jest.mock('./messages.service', () => ({
    MessagesService: jest.fn().mockImplementation(() => ({
        findAllConversations: jest.fn(),
        getLastMessagePreview: jest.fn(),
        findMessagesByConversation: jest.fn(),
        markMessagesAsRead: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
    })),
}));

import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';

describe('MessagesController', () => {
    let controller: MessagesController;
    let messagesService: MessagesService;

    const mockMessagesService = {
        findAllConversations: jest.fn(),
        getLastMessagePreview: jest.fn(),
        findMessagesByConversation: jest.fn(),
        markMessagesAsRead: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
    };

    const mockMessage: Message = {
        id: 1,
        userId: 1,
        senderName: 'João Silva',
        senderEmail: 'joao@example.com',
        message: 'Test message',
        conversationId: 1,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    } as Message;

    const mockConversation: Conversation = {
        id: 1,
        userId: 1,
        senderName: 'João Silva',
        senderEmail: 'joao@example.com',
        messageCount: 5,
        unreadCount: 2,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    } as Conversation;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessagesController],
            providers: [
                {
                    provide: MessagesService,
                    useValue: mockMessagesService,
                },
            ],
        }).compile();

        controller = module.get<MessagesController>(MessagesController);
        messagesService = module.get<MessagesService>(MessagesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllConversations', () => {
        it('deve retornar lista de conversas com preview', async () => {
            const username = 'testuser';
            const mockPreview = 'Preview da última mensagem...';
            const conversations = [mockConversation];

            mockMessagesService.findAllConversations.mockResolvedValue(conversations);
            mockMessagesService.getLastMessagePreview.mockResolvedValue(mockPreview);

            const result = await controller.findAllConversations(username);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id', mockConversation.id);
            expect(result[0]).toHaveProperty('lastMessagePreview', mockPreview);
            expect(mockMessagesService.findAllConversations).toHaveBeenCalledWith(username);
            expect(mockMessagesService.getLastMessagePreview).toHaveBeenCalledWith(
                mockConversation.id,
            );
        });

        it('deve retornar lista vazia quando não há conversas', async () => {
            const username = 'testuser';

            mockMessagesService.findAllConversations.mockResolvedValue([]);

            const result = await controller.findAllConversations(username);

            expect(result).toEqual([]);
            expect(mockMessagesService.findAllConversations).toHaveBeenCalledWith(username);
            expect(mockMessagesService.getLastMessagePreview).not.toHaveBeenCalled();
        });
    });

    describe('findMessagesByConversation', () => {
        it('deve retornar mensagens de uma conversa', async () => {
            const username = 'testuser';
            const conversationId = 1;
            const messages = [mockMessage];

            mockMessagesService.findMessagesByConversation.mockResolvedValue(messages);

            const result = await controller.findMessagesByConversation(username, conversationId);

            expect(result).toEqual(messages);
            expect(mockMessagesService.findMessagesByConversation).toHaveBeenCalledWith(
                conversationId,
                username,
            );
        });

        it('deve lançar exceção quando conversa não encontrada', async () => {
            const username = 'testuser';
            const conversationId = 999;

            mockMessagesService.findMessagesByConversation.mockRejectedValue(
                new ConversationNotFoundException(),
            );

            await expect(
                controller.findMessagesByConversation(username, conversationId),
            ).rejects.toThrow(ConversationNotFoundException);
        });
    });

    describe('markMessagesAsRead', () => {
        it('deve marcar mensagens como lidas', async () => {
            const username = 'testuser';
            const conversationId = 1;
            const markMessagesReadDto: MarkMessagesReadDto = {
                messageIds: [1, 2, 3],
            };

            mockMessagesService.markMessagesAsRead.mockResolvedValue(undefined);

            await controller.markMessagesAsRead(username, conversationId, markMessagesReadDto);

            expect(mockMessagesService.markMessagesAsRead).toHaveBeenCalledWith(
                conversationId,
                username,
                markMessagesReadDto.messageIds,
            );
        });

        it('deve lançar exceção quando conversa não encontrada', async () => {
            const username = 'testuser';
            const conversationId = 999;
            const markMessagesReadDto: MarkMessagesReadDto = {
                messageIds: [1, 2, 3],
            };

            mockMessagesService.markMessagesAsRead.mockRejectedValue(
                new ConversationNotFoundException(),
            );

            await expect(
                controller.markMessagesAsRead(username, conversationId, markMessagesReadDto),
            ).rejects.toThrow(ConversationNotFoundException);
        });
    });

    describe('findAll', () => {
        it('deve retornar todas as mensagens', async () => {
            const username = 'testuser';
            const messages = [mockMessage];

            mockMessagesService.findAll.mockResolvedValue(messages);

            const result = await controller.findAll(username);

            expect(result).toEqual(messages);
            expect(mockMessagesService.findAll).toHaveBeenCalledWith(username);
        });
    });

    describe('findById', () => {
        it('deve retornar uma mensagem por ID', async () => {
            const username = 'testuser';
            const id = 1;

            mockMessagesService.findById.mockResolvedValue(mockMessage);

            const result = await controller.findById(username, id);

            expect(result).toEqual(mockMessage);
            expect(mockMessagesService.findById).toHaveBeenCalledWith(id, username);
        });

        it('deve lançar exceção quando mensagem não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockMessagesService.findById.mockRejectedValue(new MessageNotFoundException());

            await expect(controller.findById(username, id)).rejects.toThrow(
                MessageNotFoundException,
            );
        });
    });

    describe('delete', () => {
        it('deve deletar uma mensagem', async () => {
            const username = 'testuser';
            const id = 1;

            mockMessagesService.delete.mockResolvedValue(undefined);

            await controller.delete(username, id);

            expect(mockMessagesService.delete).toHaveBeenCalledWith(id, username);
        });

        it('deve lançar exceção quando mensagem não encontrada', async () => {
            const username = 'testuser';
            const id = 999;

            mockMessagesService.delete.mockRejectedValue(new MessageNotFoundException());

            await expect(controller.delete(username, id)).rejects.toThrow(
                MessageNotFoundException,
            );
        });
    });
});

