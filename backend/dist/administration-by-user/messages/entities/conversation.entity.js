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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID of the administrator user who owns this conversation',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Conversation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'João Silva',
        description: 'Sender name (from the most recent message)',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Conversation.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'joao@example.com',
        description: 'Sender email (unique identifier for grouping messages)',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Conversation.prototype, "senderEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        nullable: false,
        example: 5,
        description: 'Total number of messages in this conversation',
    }),
    (0, typeorm_1.Column)({ nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "messageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        nullable: false,
        example: 2,
        description: 'Number of unread messages in this conversation',
    }),
    (0, typeorm_1.Column)({ nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        type: () => Date,
        example: new Date(),
        description: 'Date of the last message in this conversation',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        isArray: true,
        nullable: true,
        type: () => message_entity_1.Message,
        description: 'Messages in this conversation',
    }),
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Index)(['userId', 'senderEmail'], { unique: true })
], Conversation);
//# sourceMappingURL=conversation.entity.js.map