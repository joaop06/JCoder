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
exports.CreateUserComponentExperienceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const create_user_component_experience_position_dto_1 = require("./create-user-component-experience-position.dto");
class CreateUserComponentExperienceDto {
}
exports.CreateUserComponentExperienceDto = CreateUserComponentExperienceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        type: 'number',
        nullable: true,
        description: 'User ID (automatically filled by backend if not provided)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserComponentExperienceDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserComponentExperienceDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => create_user_component_experience_position_dto_1.CreateUserComponentExperiencePositionDto,
        description: 'Positions held at this company',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_user_component_experience_position_dto_1.CreateUserComponentExperiencePositionDto),
    __metadata("design:type", Array)
], CreateUserComponentExperienceDto.prototype, "positions", void 0);
;
//# sourceMappingURL=create-user-component-experience.dto.js.map