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
exports.GetUnreadMessagesStatsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../../users/users.service");
const message_entity_1 = require("../../messages/entities/message.entity");
const conversation_entity_1 = require("../../messages/entities/conversation.entity");
const cache_service_1 = require("../../../@common/services/cache.service");
let GetUnreadMessagesStatsUseCase = class GetUnreadMessagesStatsUseCase {
    constructor(usersService, cacheService, messageRepository, conversationRepository) {
        this.usersService = usersService;
        this.cacheService = cacheService;
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }
    async execute(username) {
        const cacheKey = this.cacheService.generateKey('dashboard', 'unread-messages', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.usersService.findOneBy({ username });
            if (!user) {
                return { total: 0, conversations: 0 };
            }
            const conversations = await this.conversationRepository.find({
                where: { userId: user.id },
                select: ['id'],
            });
            if (conversations.length === 0) {
                return { total: 0, conversations: 0 };
            }
            const conversationIds = conversations.map((c) => c.id);
            const unreadCounts = await this.messageRepository
                .createQueryBuilder('message')
                .select('message.conversationId', 'conversationId')
                .addSelect('COUNT(message.id)', 'count')
                .where('message.conversationId IN (:...conversationIds)', {
                conversationIds,
            })
                .andWhere('message.readAt IS NULL')
                .andWhere('message.deletedAt IS NULL')
                .groupBy('message.conversationId')
                .getRawMany();
            const total = unreadCounts.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
            const conversationsWithUnread = unreadCounts.length;
            return {
                total,
                conversations: conversationsWithUnread,
            };
        }, 60);
    }
};
exports.GetUnreadMessagesStatsUseCase = GetUnreadMessagesStatsUseCase;
exports.GetUnreadMessagesStatsUseCase = GetUnreadMessagesStatsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        cache_service_1.CacheService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GetUnreadMessagesStatsUseCase);
//# sourceMappingURL=get-unread-messages-stats.use-case.js.map