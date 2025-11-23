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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ConversationResponseDto {
    static fromEntity(conversation, lastMessagePreview) {
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
exports.ConversationResponseDto = ConversationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 1,
        description: 'Conversation ID',
    }),
    __metadata("design:type", Number)
], ConversationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        example: 'João Silva',
        description: 'Sender name',
    }),
    __metadata("design:type", String)
], ConversationResponseDto.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        example: 'joao@example.com',
        description: 'Sender email',
    }),
    __metadata("design:type", String)
], ConversationResponseDto.prototype, "senderEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 5,
        description: 'Total number of messages',
    }),
    __metadata("design:type", Number)
], ConversationResponseDto.prototype, "messageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 2,
        description: 'Number of unread messages',
    }),
    __metadata("design:type", Number)
], ConversationResponseDto.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'Hello! I would like to get in touch...',
        description: 'Preview of the last message',
    }),
    __metadata("design:type", String)
], ConversationResponseDto.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Date,
        nullable: true,
        description: 'Date of the last message',
    }),
    __metadata("design:type", Date)
], ConversationResponseDto.prototype, "lastMessageAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Date,
        description: 'Conversation creation date',
    }),
    __metadata("design:type", Date)
], ConversationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Date,
        description: 'Last update date',
    }),
    __metadata("design:type", Date)
], ConversationResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=conversation-response.dto.js.map