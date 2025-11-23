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
exports.UserComponentAboutMeHighlight = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_component_about_me_entity_1 = require("./user-component-about-me.entity");
let UserComponentAboutMeHighlight = class UserComponentAboutMeHighlight {
};
exports.UserComponentAboutMeHighlight = UserComponentAboutMeHighlight;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentAboutMeHighlight.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked About Me component user ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentAboutMeHighlight.prototype, "aboutMeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_component_about_me_entity_1.UserComponentAboutMe, (aboutMe) => aboutMe.highlights, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'aboutMeId' }),
    __metadata("design:type", user_component_about_me_entity_1.UserComponentAboutMe)
], UserComponentAboutMeHighlight.prototype, "aboutMe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        description: 'Highlight title',
        example: '10+ Years Experience',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentAboutMeHighlight.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'Building amazing software',
        description: 'Highlight subtitle',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentAboutMeHighlight.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '🚀',
        type: 'string',
        nullable: true,
        description: 'Emoji icon for the highlight',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentAboutMeHighlight.prototype, "emoji", void 0);
exports.UserComponentAboutMeHighlight = UserComponentAboutMeHighlight = __decorate([
    (0, typeorm_1.Entity)('users_components_about_me_highlights')
], UserComponentAboutMeHighlight);
;
//# sourceMappingURL=user-component-about-me-highlight.entity.js.map