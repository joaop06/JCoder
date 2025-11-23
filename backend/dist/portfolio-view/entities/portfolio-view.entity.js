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
exports.PortfolioView = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
let PortfolioView = class PortfolioView {
};
exports.PortfolioView = PortfolioView;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PortfolioView.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID of the portfolio owner user',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], PortfolioView.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], PortfolioView.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: '192.168.1.1',
        description: 'Visitor IP address',
    }),
    (0, typeorm_1.Column)({ nullable: true, length: 45 }),
    __metadata("design:type", String)
], PortfolioView.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'abc123def456',
        description: 'Unique browser fingerprint for deduplication',
    }),
    (0, typeorm_1.Column)({ nullable: true, length: 64 }),
    __metadata("design:type", String)
], PortfolioView.prototype, "fingerprint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'Mozilla/5.0...',
        description: 'User Agent do navegador',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PortfolioView.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'https://example.com',
        description: 'Referrer URL (where it came from)',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PortfolioView.prototype, "referer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'boolean',
        default: false,
        description: 'Indicates if the access was from the portfolio owner',
    }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PortfolioView.prototype, "isOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'BR',
        description: 'Visitor country code (ISO 3166-1 alpha-2)',
    }),
    (0, typeorm_1.Column)({ nullable: true, length: 2 }),
    __metadata("design:type", String)
], PortfolioView.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'São Paulo',
        description: 'Visitor city',
    }),
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], PortfolioView.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortfolioView.prototype, "createdAt", void 0);
exports.PortfolioView = PortfolioView = __decorate([
    (0, typeorm_1.Entity)('portfolio_views'),
    (0, typeorm_1.Index)(['userId', 'ipAddress', 'fingerprint']),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['userId', 'isOwner'])
], PortfolioView);
;
//# sourceMappingURL=portfolio-view.entity.js.map