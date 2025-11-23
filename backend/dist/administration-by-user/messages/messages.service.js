"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const message_entity_1 = require("./entities/message.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const users_service_1 = require("../users/users.service");
const message_not_found_exception_1 = require("./exceptions/message-not-found.exception");
const conversation_not_found_exception_1 = require("./exceptions/conversation-not-found.exception");
let MessagesService = class MessagesService {
    constructor(usersService, messageRepository, conversationRepository) {
        this.usersService = usersService;
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }
    async findOrCreateConversation(userId, senderName, senderEmail) {
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
        }
        else {
            if (conversation.senderName !== senderName) {
                conversation.senderName = senderName;
                await this.conversationRepository.save(conversation);
            }
        }
        return conversation;
    }
    async create(username, createMessageDto) {
        const user = await this.usersService.findOneBy({ username });
        if (!user) {
            throw new Error(`User with username '${username}' not found`);
        }
        const conversation = await this.findOrCreateConversation(user.id, createMessageDto.senderName, createMessageDto.senderEmail);
        const message = this.messageRepository.create({
            ...createMessageDto,
            senderEmail: createMessageDto.senderEmail.toLowerCase().trim(),
            userId: user.id,
            conversationId: conversation.id,
        });
        const savedMessage = await this.messageRepository.save(message);
        await this.updateConversationStats(conversation.id);
        return savedMessage;
    }
    async updateConversationStats(conversationId) {
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
    async findAllConversations(username) {
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
        const conversationIds = conversations.map(c => c.id);
        const unreadCounts = await this.messageRepository
            .createQueryBuilder('message')
            .select('message.conversationId', 'conversationId')
            .addSelect('COUNT(message.id)', 'count')
            .where('message.conversationId IN (:...conversationIds)', { conversationIds })
            .andWhere('message.readAt IS NULL')
            .andWhere('message.deletedAt IS NULL')
            .groupBy('message.conversationId')
            .getRawMany();
        const unreadCountMap = new Map();
        unreadCounts.forEach((item) => {
            unreadCountMap.set(item.conversationId, parseInt(item.count, 10));
        });
        conversations.forEach(conversation => {
            conversation.unreadCount = unreadCountMap.get(conversation.id) || 0;
        });
        return conversations;
    }
    async getLastMessagePreview(conversationId) {
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
    async findConversationById(id, username) {
        const user = await this.usersService.findOneBy({ username });
        if (!user) {
            throw new Error(`User with username '${username}' not found`);
        }
        const conversation = await this.conversationRepository.findOne({
            where: { id, userId: user.id },
        });
        if (!conversation) {
            throw new conversation_not_found_exception_1.ConversationNotFoundException();
        }
        return conversation;
    }
    async findMessagesByConversation(conversationId, username) {
        await this.findConversationById(conversationId, username);
        return await this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
        });
    }
    async markMessagesAsRead(conversationId, username, messageIds) {
        await this.findConversationById(conversationId, username);
        const readAtDate = new Date();
        const result = await this.messageRepository
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ readAt: readAtDate })
            .where('conversationId = :conversationId', { conversationId })
            .andWhere('readAt IS NULL')
            .andWhere('id IN (:...messageIds)', { messageIds })
            .execute();
        if (result.affected && result.affected > 0) {
            await this.updateConversationStats(conversationId);
        }
    }
    async findAll(username) {
        return await this.messageRepository.find({
            where: { user: { username } },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id, username) {
        const message = await this.messageRepository.findOne({
            where: { id, user: { username } },
            relations: ['user', 'conversation'],
        });
        if (!message) {
            throw new message_not_found_exception_1.MessageNotFoundException();
        }
        return message;
    }
    async delete(id, username) {
        const message = await this.findById(id, username);
        await this.messageRepository.softDelete(id);
        if (message.conversationId) {
            await this.updateConversationStats(message.conversationId);
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_2.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map