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
exports.Technology = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const expertise_level_enum_1 = require("../enums/expertise-level.enum");
const swagger_1 = require("@nestjs/swagger");
const application_entity_1 = require("../../applications/entities/application.entity");
let Technology = class Technology {
};
exports.Technology = Technology;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Technology unique identifier',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Technology.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Node.js',
        description: 'Technology name',
    }),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Technology.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        example: 'nodejs-logo.png',
        description: 'Profile image filename for the technology (logo, icon, etc.)',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Technology.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Display order for sorting technologies (lower numbers appear first)',
    }),
    (0, typeorm_1.Column)({ nullable: false, default: 1 }),
    __metadata("design:type", Number)
], Technology.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: expertise_level_enum_1.ExpertiseLevel,
        example: expertise_level_enum_1.ExpertiseLevel.INTERMEDIATE,
        nullable: false,
        description: 'Expertise level in the technology',
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: expertise_level_enum_1.ExpertiseLevel,
        default: expertise_level_enum_1.ExpertiseLevel.INTERMEDIATE,
    }),
    __metadata("design:type", String)
], Technology.prototype, "expertiseLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: true,
        example: true,
        nullable: false,
        type: 'boolean',
        description: 'Indicates whether the technology is active and visible',
    }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Technology.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Technology.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.technologies, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Technology.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => [application_entity_1.Application],
        description: 'Applications that use this technology',
    }),
    (0, typeorm_1.ManyToMany)(() => application_entity_1.Application, (application) => application.technologies),
    __metadata("design:type", Array)
], Technology.prototype, "applications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
        description: 'Date when the technology was created',
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Technology.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
        description: 'Date when the technology was last updated',
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Technology.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
        description: 'Date when the technology was soft deleted',
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Technology.prototype, "deletedAt", void 0);
exports.Technology = Technology = __decorate([
    (0, typeorm_1.Entity)('technologies')
], Technology);
;
//# sourceMappingURL=technology.entity.js.map