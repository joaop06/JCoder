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
exports.EmailVerification = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let EmailVerification = class EmailVerification {
};
exports.EmailVerification = EmailVerification;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailVerification.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'user@example.com',
        description: 'Email address to verify',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EmailVerification.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123456',
        type: 'string',
        nullable: false,
        description: 'Verification code',
    }),
    (0, typeorm_1.Column)({ nullable: false, length: 6 }),
    __metadata("design:type", String)
], EmailVerification.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        type: 'boolean',
        nullable: false,
        description: 'Whether the code has been verified',
    }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], EmailVerification.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        description: 'Expiration date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, typeorm_1.Column)({ type: 'datetime', nullable: false }),
    __metadata("design:type", Date)
], EmailVerification.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        description: 'Creation date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmailVerification.prototype, "createdAt", void 0);
exports.EmailVerification = EmailVerification = __decorate([
    (0, typeorm_1.Entity)('email_verifications'),
    (0, typeorm_1.Index)(['email', 'code'], { unique: true })
], EmailVerification);
;
//# sourceMappingURL=email-verification.entity.js.map