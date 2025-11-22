import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { MessageNotFoundException } from './exceptions/message-not-found.exception';
import { ConversationNotFoundException } from './exceptions/conversation-not-found.exception';
import { CreateMessageDto } from './dto/create-message.dto';

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
jest.mock('../users/users.service', () => ({
    UsersService: jest.fn().mockImplementation(() => ({
        findOneBy: jest.fn(),
    })),
}));

import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';

describe('MessagesService', () => {
    let service: MessagesService;
    let messageRepository: Repository<Message>;
    let conversationRepository: Repository<Conversation>;
    let usersService: UsersService;

    const mockMessageRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockConversationRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockUsersService = {
        findOneBy: jest.fn(),
    };

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
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
            providers: [
                MessagesService,
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockMessageRepository,
                },
                {
                    provide: getRepositoryToken(Conversation),
                    useValue: mockConversationRepository,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        service = module.get<MessagesService>(MessagesService);
        messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
        conversationRepository = module.get<Repository<Conversation>>(
            getRepositoryToken(Conversation),
        );
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findOrCreateConversation', () => {
        it('deve retornar conversa existente', async () => {
            const userId = 1;
            const senderName = 'João Silva';
            const senderEmail = 'joao@example.com';

            mockConversationRepository.findOne.mockResolvedValue(mockConversation);

            const result = await service.findOrCreateConversation(userId, senderName, senderEmail);

            expect(result).toEqual(mockConversation);
            expect(mockConversationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    userId,
                    senderEmail: senderEmail.toLowerCase().trim(),
                },
            });
            expect(mockConversationRepository.create).not.toHaveBeenCalled();
        });

        it('deve criar nova conversa quando não existe', async () => {
            const userId = 1;
            const senderName = 'João Silva';
            const senderEmail = 'joao@example.com';

            mockConversationRepository.findOne.mockResolvedValue(null);
            mockConversationRepository.create.mockReturnValue(mockConversation);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            const result = await service.findOrCreateConversation(userId, senderName, senderEmail);

            expect(result).toEqual(mockConversation);
            expect(mockConversationRepository.create).toHaveBeenCalledWith({
                userId,
                senderName,
                senderEmail: senderEmail.toLowerCase().trim(),
                messageCount: 0,
                unreadCount: 0,
            });
            expect(mockConversationRepository.save).toHaveBeenCalled();
        });

        it('deve atualizar nome do remetente quando mudou', async () => {
            const userId = 1;
            const senderName = 'João Silva Atualizado';
            const senderEmail = 'joao@example.com';
            const existingConversation = { ...mockConversation, senderName: 'João Silva' };

            mockConversationRepository.findOne.mockResolvedValue(existingConversation);
            mockConversationRepository.save.mockResolvedValue({
                ...existingConversation,
                senderName,
            });

            const result = await service.findOrCreateConversation(userId, senderName, senderEmail);

            expect(mockConversationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ senderName }),
            );
        });

        it('deve normalizar email para lowercase', async () => {
            const userId = 1;
            const senderName = 'João Silva';
            const senderEmail = 'JOÃO@EXAMPLE.COM';

            mockConversationRepository.findOne.mockResolvedValue(null);
            mockConversationRepository.create.mockReturnValue(mockConversation);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            await service.findOrCreateConversation(userId, senderName, senderEmail);

            expect(mockConversationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    userId,
                    senderEmail: 'joão@example.com',
                },
            });
        });
    });

    describe('create', () => {
        it('deve criar uma nova mensagem', async () => {
            const username = 'testuser';
            const createMessageDto: CreateMessageDto = {
                senderName: 'João Silva',
                senderEmail: 'joao@example.com',
                message: 'Test message',
            };

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(mockConversation);
            mockMessageRepository.create.mockReturnValue(mockMessage);
            mockMessageRepository.save.mockResolvedValue(mockMessage);
            mockMessageRepository.find.mockResolvedValue([mockMessage]);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            const result = await service.create(username, createMessageDto);

            expect(result).toEqual(mockMessage);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
            expect(mockMessageRepository.create).toHaveBeenCalled();
            expect(mockMessageRepository.save).toHaveBeenCalled();
        });

        it('deve lançar erro quando usuário não encontrado', async () => {
            const username = 'nonexistent';
            const createMessageDto: CreateMessageDto = {
                senderName: 'João Silva',
                senderEmail: 'joao@example.com',
                message: 'Test message',
            };

            mockUsersService.findOneBy.mockResolvedValue(null);

            await expect(service.create(username, createMessageDto)).rejects.toThrow(
                `User with username '${username}' not found`,
            );
        });
    });

    describe('updateConversationStats', () => {
        it('deve atualizar estatísticas da conversa', async () => {
            const conversationId = 1;
            const messages = [mockMessage];
            const unreadMessages = [mockMessage];

            mockConversationRepository.findOne.mockResolvedValue(mockConversation);
            mockMessageRepository.find
                .mockResolvedValueOnce(messages)
                .mockResolvedValueOnce(unreadMessages);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            await service.updateConversationStats(conversationId);

            expect(mockConversationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageCount: 1,
                    unreadCount: 1,
                    lastMessageAt: messages[0].createdAt,
                }),
            );
        });

        it('não deve fazer nada quando conversa não encontrada', async () => {
            const conversationId = 999;

            mockConversationRepository.findOne.mockResolvedValue(null);

            await service.updateConversationStats(conversationId);

            expect(mockMessageRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('findAllConversations', () => {
        it('deve retornar todas as conversas', async () => {
            const username = 'testuser';
            const conversations = [mockConversation];

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.find.mockResolvedValue(conversations);
            mockMessageRepository.createQueryBuilder.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([
                    { conversationId: 1, count: '2' },
                ]),
            });

            const result = await service.findAllConversations(username);

            expect(result).toHaveLength(1);
            expect(result[0].unreadCount).toBe(2);
            expect(mockUsersService.findOneBy).toHaveBeenCalledWith({ username });
        });

        it('deve retornar lista vazia quando não há conversas', async () => {
            const username = 'testuser';

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.find.mockResolvedValue([]);

            const result = await service.findAllConversations(username);

            expect(result).toEqual([]);
        });

        it('deve lançar erro quando usuário não encontrado', async () => {
            const username = 'nonexistent';

            mockUsersService.findOneBy.mockResolvedValue(null);

            await expect(service.findAllConversations(username)).rejects.toThrow(
                `User with username '${username}' not found`,
            );
        });
    });

    describe('getLastMessagePreview', () => {
        it('deve retornar preview da última mensagem', async () => {
            const conversationId = 1;
            const lastMessage = { ...mockMessage, message: 'Short message' };

            mockMessageRepository.findOne.mockResolvedValue(lastMessage);

            const result = await service.getLastMessagePreview(conversationId);

            expect(result).toBe('Short message');
        });

        it('deve truncar mensagem longa', async () => {
            const conversationId = 1;
            const longMessage = 'a'.repeat(150);
            const lastMessage = { ...mockMessage, message: longMessage };

            mockMessageRepository.findOne.mockResolvedValue(lastMessage);

            const result = await service.getLastMessagePreview(conversationId);

            expect(result).toBe('a'.repeat(100) + '...');
            expect(result.length).toBe(103);
        });

        it('deve retornar undefined quando não há mensagens', async () => {
            const conversationId = 1;

            mockMessageRepository.findOne.mockResolvedValue(null);

            const result = await service.getLastMessagePreview(conversationId);

            expect(result).toBeUndefined();
        });
    });

    describe('findConversationById', () => {
        it('deve retornar conversa por ID', async () => {
            const id = 1;
            const username = 'testuser';

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(mockConversation);

            const result = await service.findConversationById(id, username);

            expect(result).toEqual(mockConversation);
            expect(mockConversationRepository.findOne).toHaveBeenCalledWith({
                where: { id, userId: mockUser.id },
            });
        });

        it('deve lançar exceção quando conversa não encontrada', async () => {
            const id = 999;
            const username = 'testuser';

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(null);

            await expect(service.findConversationById(id, username)).rejects.toThrow(
                ConversationNotFoundException,
            );
        });
    });

    describe('findMessagesByConversation', () => {
        it('deve retornar mensagens de uma conversa', async () => {
            const conversationId = 1;
            const username = 'testuser';
            const messages = [mockMessage];

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(mockConversation);
            mockMessageRepository.find.mockResolvedValue(messages);

            const result = await service.findMessagesByConversation(conversationId, username);

            expect(result).toEqual(messages);
            expect(mockMessageRepository.find).toHaveBeenCalledWith({
                where: { conversationId },
                order: { createdAt: 'ASC' },
            });
        });
    });

    describe('markMessagesAsRead', () => {
        it('deve marcar mensagens como lidas', async () => {
            const conversationId = 1;
            const username = 'testuser';
            const messageIds = [1, 2, 3];

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(mockConversation);
            mockMessageRepository.createQueryBuilder.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 3 }),
            });
            mockMessageRepository.find.mockResolvedValue([mockMessage]);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            await service.markMessagesAsRead(conversationId, username, messageIds);

            expect(mockMessageRepository.createQueryBuilder).toHaveBeenCalled();
        });

        it('não deve atualizar estatísticas quando nenhuma mensagem foi atualizada', async () => {
            const conversationId = 1;
            const username = 'testuser';
            const messageIds = [1, 2, 3];

            mockUsersService.findOneBy.mockResolvedValue(mockUser);
            mockConversationRepository.findOne.mockResolvedValue(mockConversation);
            mockMessageRepository.createQueryBuilder.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 0 }),
            });

            await service.markMessagesAsRead(conversationId, username, messageIds);

            expect(mockMessageRepository.find).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('deve retornar todas as mensagens', async () => {
            const username = 'testuser';
            const messages = [mockMessage];

            mockMessageRepository.find.mockResolvedValue(messages);

            const result = await service.findAll(username);

            expect(result).toEqual(messages);
            expect(mockMessageRepository.find).toHaveBeenCalledWith({
                where: { user: { username } },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findById', () => {
        it('deve retornar mensagem por ID', async () => {
            const id = 1;
            const username = 'testuser';

            mockMessageRepository.findOne.mockResolvedValue(mockMessage);

            const result = await service.findById(id, username);

            expect(result).toEqual(mockMessage);
            expect(mockMessageRepository.findOne).toHaveBeenCalledWith({
                where: { id, user: { username } },
                relations: ['user', 'conversation'],
            });
        });

        it('deve lançar exceção quando mensagem não encontrada', async () => {
            const id = 999;
            const username = 'testuser';

            mockMessageRepository.findOne.mockResolvedValue(null);

            await expect(service.findById(id, username)).rejects.toThrow(
                MessageNotFoundException,
            );
        });
    });

    describe('delete', () => {
        it('deve deletar uma mensagem', async () => {
            const id = 1;
            const username = 'testuser';

            mockMessageRepository.findOne.mockResolvedValue(mockMessage);
            mockMessageRepository.softDelete.mockResolvedValue({ affected: 1 });
            mockMessageRepository.find.mockResolvedValue([mockMessage]);
            mockConversationRepository.save.mockResolvedValue(mockConversation);

            await service.delete(id, username);

            expect(mockMessageRepository.findOne).toHaveBeenCalledWith({
                where: { id, user: { username } },
                relations: ['user', 'conversation'],
            });
            expect(mockMessageRepository.softDelete).toHaveBeenCalledWith(id);
        });

        it('não deve atualizar estatísticas quando mensagem não tem conversa', async () => {
            const id = 1;
            const username = 'testuser';
            const messageWithoutConversation = { ...mockMessage, conversationId: null };

            mockMessageRepository.findOne.mockResolvedValue(messageWithoutConversation);
            mockMessageRepository.softDelete.mockResolvedValue({ affected: 1 });

            await service.delete(id, username);

            expect(mockMessageRepository.find).not.toHaveBeenCalled();
        });
    });
});

