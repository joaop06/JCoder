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
exports.UpdateTechnologyDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const swagger_1 = require("@nestjs/swagger");
const create_technology_dto_1 = require("./create-technology.dto");
const class_validator_1 = require("class-validator");
class UpdateTechnologyDto extends (0, mapped_types_1.PartialType)(create_technology_dto_1.CreateTechnologyDto) {
}
exports.UpdateTechnologyDto = UpdateTechnologyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'boolean',
        required: false,
        nullable: false,
        example: true,
        description: 'Indicates whether the technology is active',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTechnologyDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        required: false,
        nullable: true,
        example: 'profile-image.jpg',
        description: 'Profile image filename',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTechnologyDto.prototype, "profileImage", void 0);
//# sourceMappingURL=update-technology.dto.js.map