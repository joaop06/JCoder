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
exports.UserComponentEducation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const user_component_certificate_entity_1 = require("./user-component-certificate.entity");
let UserComponentEducation = class UserComponentEducation {
};
exports.UserComponentEducation = UserComponentEducation;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentEducation.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentEducation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userComponentEducation, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserComponentEducation.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'University of Technology',
        description: 'Educational institution name',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentEducation.prototype, "institutionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Computer Science',
        description: 'Course/field of study name',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentEducation.prototype, "courseName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'Bachelor\'s Degree',
        description: 'Degree/qualification type',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentEducation.prototype, "degree", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date('2020-01-01'),
        description: 'Education start date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], UserComponentEducation.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => Date,
        example: new Date('2024-12-31'),
        description: 'Education end date (or expected end date)',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserComponentEducation.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: false,
        example: false,
        nullable: false,
        type: 'boolean',
        description: 'Indicates if currently studying (if true, endDate should be null or future date)',
    }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserComponentEducation.prototype, "isCurrentlyStudying", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_certificate_entity_1.UserComponentCertificate,
        description: 'Related certificates (ManyToMany relationship)',
    }),
    (0, typeorm_1.ManyToMany)(() => user_component_certificate_entity_1.UserComponentCertificate, (certificate) => certificate.educations),
    __metadata("design:type", Array)
], UserComponentEducation.prototype, "certificates", void 0);
exports.UserComponentEducation = UserComponentEducation = __decorate([
    (0, typeorm_1.Entity)('users_components_educations')
], UserComponentEducation);
;
//# sourceMappingURL=user-component-education.entity.js.map