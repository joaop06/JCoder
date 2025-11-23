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
exports.UserComponentCertificate = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const user_component_education_entity_1 = require("./user-component-education.entity");
let UserComponentCertificate = class UserComponentCertificate {
};
exports.UserComponentCertificate = UserComponentCertificate;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserComponentCertificate.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], UserComponentCertificate.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userComponentCertificate, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserComponentCertificate.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        description: 'Certificate name',
        example: 'AWS Certified Solutions Architect',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentCertificate.prototype, "certificateName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'AWS-1234567890',
        description: 'Certificate registration number',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentCertificate.prototype, "registrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        description: 'URL to verify certificate authenticity',
        example: 'https://verify.credential.com/certificate/123456',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentCertificate.prototype, "verificationUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date('2023-01-15'),
        description: 'Certificate issuance date',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], UserComponentCertificate.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'John Doe',
        description: 'Name of the person the certificate was issued to',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], UserComponentCertificate.prototype, "issuedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        example: 'certificate-profile.png',
        description: 'Certificate profile image filename',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserComponentCertificate.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_education_entity_1.UserComponentEducation,
        description: 'Related education records (ManyToMany relationship)',
    }),
    (0, typeorm_1.ManyToMany)(() => user_component_education_entity_1.UserComponentEducation, (education) => education.certificates, {
        nullable: true,
    }),
    (0, typeorm_1.JoinTable)({
        name: 'users_certificates_educations',
        joinColumn: { name: 'certificateId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'educationId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], UserComponentCertificate.prototype, "educations", void 0);
exports.UserComponentCertificate = UserComponentCertificate = __decorate([
    (0, typeorm_1.Entity)('users_components_certificates')
], UserComponentCertificate);
;
//# sourceMappingURL=user-component-certificate.entity.js.map