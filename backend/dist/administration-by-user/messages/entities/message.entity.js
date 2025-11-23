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
exports.Message = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const conversation_entity_1 = require("./conversation.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID of the administrator user who will receive the message',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Message.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.messages, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Message.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'João Silva',
        description: 'Message sender name',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'joao@example.com',
        description: 'Message sender email',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "senderEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Hello! I would like to get in touch about an opportunity...',
        description: 'Message content',
    }),
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: true,
        description: 'ID of the conversation this message belongs to',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_entity_1.Conversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'conversationId' }),
    __metadata("design:type", conversation_entity_1.Conversation)
], Message.prototype, "conversation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        type: () => Date,
        example: new Date(),
        description: 'Date when the message was read by the administrator',
    }),
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "deletedAt", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('messages')
], Message);
;
//# sourceMappingURL=message.entity.js.map