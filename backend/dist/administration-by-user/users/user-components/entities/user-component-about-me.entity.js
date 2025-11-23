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
exports.UserComponentAboutMe = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const user_component_about_me_highlight_entity_1 = require("./user-component-about-me-highlight.entity");
let UserComponentAboutMe = class UserComponentAboutMe {
};
exports.UserComponentAboutMe = UserComponentAboutMe;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentAboutMe.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentAboutMe.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.userComponentAboutMe, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserComponentAboutMe.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'Senior Software Engineer',
        description: 'User job title/occupation',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentAboutMe.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: '<p>Hello, I am a software engineer...</p>',
        description: 'Rich text description (HTML formatted)',
    }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], UserComponentAboutMe.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        description: 'Highlights/achievements',
        type: () => user_component_about_me_highlight_entity_1.UserComponentAboutMeHighlight,
    }),
    (0, typeorm_1.OneToMany)(() => user_component_about_me_highlight_entity_1.UserComponentAboutMeHighlight, (highlight) => highlight.aboutMe, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], UserComponentAboutMe.prototype, "highlights", void 0);
exports.UserComponentAboutMe = UserComponentAboutMe = __decorate([
    (0, typeorm_1.Entity)('users_components_about_me')
], UserComponentAboutMe);
;
//# sourceMappingURL=user-component-about-me.entity.js.map