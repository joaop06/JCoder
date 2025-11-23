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
exports.CreateUserComponentAboutMeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const create_user_component_about_me_highlight_dto_1 = require("./create-user-component-about-me-highlight.dto");
class CreateUserComponentAboutMeDto {
}
exports.CreateUserComponentAboutMeDto = CreateUserComponentAboutMeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'User ID',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserComponentAboutMeDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        example: 'Senior Software Engineer',
        description: 'User job title/occupation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserComponentAboutMeDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        example: '<p>Hello, I am a software engineer...</p>',
        description: 'Rich text description (HTML formatted)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserComponentAboutMeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        description: 'Highlights/achievements',
        type: () => create_user_component_about_me_highlight_dto_1.CreateUserComponentAboutMeHighlightDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_user_component_about_me_highlight_dto_1.CreateUserComponentAboutMeHighlightDto),
    __metadata("design:type", Array)
], CreateUserComponentAboutMeDto.prototype, "highlights", void 0);
;
//# sourceMappingURL=create-user-component-about-me.dto.js.map