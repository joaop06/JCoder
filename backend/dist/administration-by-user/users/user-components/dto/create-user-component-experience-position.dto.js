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
exports.CreateUserComponentExperiencePositionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const work_location_type_enum_1 = require("../../enums/work-location-type.enum");
class CreateUserComponentExperiencePositionDto {
}
exports.CreateUserComponentExperiencePositionDto = CreateUserComponentExperiencePositionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        type: 'number',
        nullable: true,
        description: 'Linked experience component ID (automatically filled by backend if not provided)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserComponentExperiencePositionDto.prototype, "experienceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        nullable: false,
        description: 'Job position title',
        example: 'Senior Software Engineer',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserComponentExperiencePositionDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Position start date',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateUserComponentExperiencePositionDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Position end date (null if current position)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateUserComponentExperiencePositionDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if this is the current position',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserComponentExperiencePositionDto.prototype, "isCurrentPosition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        example: 'São Paulo, Brazil',
        description: 'Job location',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserComponentExperiencePositionDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        enum: work_location_type_enum_1.WorkLocationTypeEnum,
        description: 'Work location type',
        example: work_location_type_enum_1.WorkLocationTypeEnum.REMOTE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(work_location_type_enum_1.WorkLocationTypeEnum),
    __metadata("design:type", String)
], CreateUserComponentExperiencePositionDto.prototype, "locationType", void 0);
;
//# sourceMappingURL=create-user-component-experience-position.dto.js.map