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
exports.UserComponentExperience = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const user_component_experience_position_entity_1 = require("./user-component-experience-position.entity");
let UserComponentExperience = class UserComponentExperience {
};
exports.UserComponentExperience = UserComponentExperience;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentExperience.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentExperience.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userComponentExperience, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserComponentExperience.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentExperience.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_experience_position_entity_1.UserComponentExperiencePosition,
        description: 'Positions held at this company',
    }),
    (0, typeorm_1.OneToMany)(() => user_component_experience_position_entity_1.UserComponentExperiencePosition, (position) => position.experience, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], UserComponentExperience.prototype, "positions", void 0);
exports.UserComponentExperience = UserComponentExperience = __decorate([
    (0, typeorm_1.Entity)('users_components_experiences')
], UserComponentExperience);
;
//# sourceMappingURL=user-component-experience.entity.js.map