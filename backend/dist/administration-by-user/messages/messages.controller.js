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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const message_entity_1 = require("./entities/message.entity");
const messages_service_1 = require("./messages.service");
const owner_guard_1 = require("../../@common/guards/owner.guard");
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const mark_messages_read_dto_1 = require("./dto/mark-messages-read.dto");
const conversation_response_dto_1 = require("./dto/conversation-response.dto");
const message_not_found_exception_1 = require("./exceptions/message-not-found.exception");
const swagger_1 = require("@nestjs/swagger");
const conversation_not_found_exception_1 = require("./exceptions/conversation-not-found.exception");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async findAllConversations(username) {
        const conversations = await this.messagesService.findAllConversations(username);
        const conversationsWithPreview = await Promise.all(conversations.map(async (conversation) => {
            const preview = await this.messagesService.getLastMessagePreview(conversation.id);
            return conversation_response_dto_1.ConversationResponseDto.fromEntity(conversation, preview);
        }));
        return conversationsWithPreview;
    }
    async findMessagesByConversation(username, conversationId) {
        return await this.messagesService.findMessagesByConversation(conversationId, username);
    }
    async markMessagesAsRead(username, conversationId, markMessagesReadDto) {
        return await this.messagesService.markMessagesAsRead(conversationId, username, markMessagesReadDto.messageIds);
    }
    async findAll(username) {
        return await this.messagesService.findAll(username);
    }
    async findById(username, id) {
        return await this.messagesService.findById(id, username);
    }
    async delete(username, id) {
        return await this.messagesService.delete(id, username);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({ isArray: true, type: () => conversation_response_dto_1.ConversationResponseDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findAllConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({ isArray: true, type: () => message_entity_1.Message }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => conversation_not_found_exception_1.ConversationNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findMessagesByConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/mark-read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => conversation_not_found_exception_1.ConversationNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, mark_messages_read_dto_1.MarkMessagesReadDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({ isArray: true, type: () => message_entity_1.Message }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({ type: () => message_entity_1.Message }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => message_not_found_exception_1.MessageNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, owner_guard_1.OwnerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => message_not_found_exception_1.MessageNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "delete", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)(':username/messages'),
    (0, swagger_1.ApiTags)('Administration Messages'),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
;
//# sourceMappingURL=messages.controller.js.map