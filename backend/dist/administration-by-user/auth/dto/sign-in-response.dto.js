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
exports.SignInResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_entity_1 = require("../../users/entities/user.entity");
class SignInResponseDto {
}
exports.SignInResponseDto = SignInResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        description: 'Access token for requests',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2FvQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiY3JlYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwidXBkYXRlZEF0IjoiMjAyNS0xMC0wN1QxNToxMToyMC43NjNaIiwiZGVsZXRlZEF0IjpudWxsLCJpYXQiOjE3NjAxMDM3OTMsImV4cCI6MTc2MDEwNzM5M30.dnSeqrKUobDcSCxztlLuWnrvJgZoYxobW-CY0rKor4U',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignInResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        type: () => user_entity_1.User,
        description: 'Logged-in user data',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], SignInResponseDto.prototype, "user", void 0);
;
//# sourceMappingURL=sign-in-response.dto.js.map