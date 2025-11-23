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
exports.UpdateProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'johndoe',
        description: 'Unique username for login and portfolio URL',
        minLength: 3,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username must contain only letters, numbers, underscores, and hyphens',
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'John',
        description: 'User first name',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'John Doe',
        description: 'User full name',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'your@email.com',
        description: 'User email',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'https://github.com/johndoe',
        description: 'GitHub profile URL',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "githubUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'https://linkedin.com/in/johndoe',
        description: 'LinkedIn profile URL',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'CurrentPassword123!',
        description: 'Current password (required if changing password)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'NewPassword123!',
        description: 'New password',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: 'profile-123e4567-e89b-12d3-a456-426614174000.jpg',
        description: 'User profile image filename',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        example: '(206) 742-5187',
        description: 'User phone number',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        description: 'User address',
        example: '32600 42nd Ave SW, Seattle, WA 98116, United States',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "address", void 0);
;
//# sourceMappingURL=update-profile.dto.js.map