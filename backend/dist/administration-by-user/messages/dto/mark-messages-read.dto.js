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
exports.MarkMessagesReadDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class MarkMessagesReadDto {
}
exports.MarkMessagesReadDto = MarkMessagesReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        isArray: true,
        required: true,
        example: [1, 2, 3],
        description: 'Array of message IDs to mark as read. Must be a non-empty array.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], MarkMessagesReadDto.prototype, "messageIds", void 0);
//# sourceMappingURL=mark-messages-read.dto.js.map