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
exports.UserComponentReference = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
let UserComponentReference = class UserComponentReference {
};
exports.UserComponentReference = UserComponentReference;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentReference.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentReference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userComponentReference, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserComponentReference.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        description: 'Reference person name',
        example: 'Marissa Leeds',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentReference.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        description: 'Company or organization name',
        example: 'Gold Coast Hotel',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentReference.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'Reference email',
        example: 'mleeds@goldcoast.com',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentReference.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'Reference phone number',
        example: '732-189-0909',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentReference.prototype, "phone", void 0);
exports.UserComponentReference = UserComponentReference = __decorate([
    (0, typeorm_1.Entity)('users_components_references')
], UserComponentReference);
;
//# sourceMappingURL=user-component-reference.entity.js.map