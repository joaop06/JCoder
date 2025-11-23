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
exports.CreateTechnologyDto = void 0;
const class_validator_1 = require("class-validator");
const expertise_level_enum_1 = require("../enums/expertise-level.enum");
const swagger_1 = require("@nestjs/swagger");
class CreateTechnologyDto {
}
exports.CreateTechnologyDto = CreateTechnologyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        required: false,
        nullable: false,
        example: 'username',
        description: 'Username of the user',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTechnologyDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Node.js',
        description: 'Technology name (must be unique)',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTechnologyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: expertise_level_enum_1.ExpertiseLevel,
        required: false,
        nullable: false,
        example: expertise_level_enum_1.ExpertiseLevel.INTERMEDIATE,
        description: 'Expertise level in the technology',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(expertise_level_enum_1.ExpertiseLevel),
    __metadata("design:type", String)
], CreateTechnologyDto.prototype, "expertiseLevel", void 0);
;
//# sourceMappingURL=create-technology.dto.js.map