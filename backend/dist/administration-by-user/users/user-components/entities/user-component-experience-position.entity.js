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
exports.UserComponentExperiencePosition = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const work_location_type_enum_1 = require("../../enums/work-location-type.enum");
const user_component_experience_entity_1 = require("./user-component-experience.entity");
let UserComponentExperiencePosition = class UserComponentExperiencePosition {
};
exports.UserComponentExperiencePosition = UserComponentExperiencePosition;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentExperiencePosition.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked experience component ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentExperiencePosition.prototype, "experienceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_component_experience_entity_1.UserComponentExperience, (experience) => experience.positions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'experienceId' }),
    __metadata("design:type", user_component_experience_entity_1.UserComponentExperience)
], UserComponentExperiencePosition.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Senior Software Engineer',
        description: 'Job position title',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentExperiencePosition.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Position start date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], UserComponentExperiencePosition.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Position end date (null if current position)',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserComponentExperiencePosition.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if this is the current position',
    }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserComponentExperiencePosition.prototype, "isCurrentPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'São Paulo, Brazil',
        description: 'Job location',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentExperiencePosition.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: true,
        enum: work_location_type_enum_1.WorkLocationTypeEnum,
        description: 'Work location type',
        example: work_location_type_enum_1.WorkLocationTypeEnum.REMOTE,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: work_location_type_enum_1.WorkLocationTypeEnum,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserComponentExperiencePosition.prototype, "locationType", void 0);
exports.UserComponentExperiencePosition = UserComponentExperiencePosition = __decorate([
    (0, typeorm_1.Entity)('users_components_experiences_positions')
], UserComponentExperiencePosition);
;
//# sourceMappingURL=user-component-experience-position.entity.js.map