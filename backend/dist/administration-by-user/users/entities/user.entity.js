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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const message_entity_1 = require("../../messages/entities/message.entity");
const swagger_1 = require("@nestjs/swagger");
const technology_entity_1 = require("../../technologies/entities/technology.entity");
const application_entity_1 = require("../../applications/entities/application.entity");
const user_component_about_me_entity_1 = require("../user-components/entities/user-component-about-me.entity");
const user_component_education_entity_1 = require("../user-components/entities/user-component-education.entity");
const user_component_reference_entity_1 = require("../user-components/entities/user-component-reference.entity");
const user_component_experience_entity_1 = require("../user-components/entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("../user-components/entities/user-component-certificate.entity");
const application_component_api_entity_1 = require("../../applications/application-components/entities/application-component-api.entity");
const application_component_mobile_entity_1 = require("../../applications/application-components/entities/application-component-mobile.entity");
const application_component_library_entity_1 = require("../../applications/application-components/entities/application-component-library.entity");
const application_component_frontend_entity_1 = require("../../applications/application-components/entities/application-component-frontend.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    }),
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'John',
        description: 'User first name',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'John Doe',
        description: 'User full name',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
        example: 'your@email.com',
        description: 'User contact email',
    }),
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'GitHub profile URL',
        example: 'https://github.com/johndoe',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "githubUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'LinkedIn profile URL',
        example: 'https://linkedin.com/in/johndoe',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "linkedinUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'User profile image filename',
        example: 'profile-123e4567-e89b-12d3-a456-426614174000.jpg',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'User phone number',
        example: '(206) 742-5187',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        description: 'User address',
        example: '32600 42nd Ave SW, Seattle, WA 98116, United States',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => user_component_about_me_entity_1.UserComponentAboutMe,
        description: 'About Me component',
    }),
    (0, typeorm_1.OneToOne)(() => user_component_about_me_entity_1.UserComponentAboutMe, (aboutMe) => aboutMe.user),
    __metadata("design:type", user_component_about_me_entity_1.UserComponentAboutMe)
], User.prototype, "userComponentAboutMe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_education_entity_1.UserComponentEducation,
        description: 'Education components',
    }),
    (0, typeorm_1.OneToMany)(() => user_component_education_entity_1.UserComponentEducation, (education) => education.user),
    __metadata("design:type", Array)
], User.prototype, "userComponentEducation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_experience_entity_1.UserComponentExperience,
        description: 'Experience components',
    }),
    (0, typeorm_1.OneToMany)(() => user_component_experience_entity_1.UserComponentExperience, (experience) => experience.user),
    __metadata("design:type", Array)
], User.prototype, "userComponentExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => Array,
        description: 'Certificate components',
    }),
    (0, typeorm_1.OneToMany)(() => user_component_certificate_entity_1.UserComponentCertificate, (certificate) => certificate.user),
    __metadata("design:type", Array)
], User.prototype, "userComponentCertificate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => user_component_reference_entity_1.UserComponentReference,
        description: 'Reference components',
    }),
    (0, typeorm_1.OneToMany)(() => user_component_reference_entity_1.UserComponentReference, (reference) => reference.user),
    __metadata("design:type", Array)
], User.prototype, "userComponentReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => technology_entity_1.Technology,
        description: 'Technologies',
    }),
    (0, typeorm_1.OneToMany)(() => technology_entity_1.Technology, (technology) => technology.user),
    __metadata("design:type", Array)
], User.prototype, "technologies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => application_entity_1.Application,
        description: 'Applications',
    }),
    (0, typeorm_1.OneToMany)(() => application_entity_1.Application, (application) => application.user),
    __metadata("design:type", Array)
], User.prototype, "applications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => application_component_api_entity_1.ApplicationComponentApi,
        description: 'Application components api',
    }),
    (0, typeorm_1.OneToMany)(() => application_component_api_entity_1.ApplicationComponentApi, (applicationComponentApi) => applicationComponentApi.user),
    __metadata("design:type", Array)
], User.prototype, "applicationsComponentsApis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => application_component_mobile_entity_1.ApplicationComponentMobile,
        description: 'Application components mobile',
    }),
    (0, typeorm_1.OneToMany)(() => application_component_mobile_entity_1.ApplicationComponentMobile, (applicationComponentMobile) => applicationComponentMobile.user),
    __metadata("design:type", Array)
], User.prototype, "applicationsComponentsMobiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => application_component_library_entity_1.ApplicationComponentLibrary,
        description: 'Application components library',
    }),
    (0, typeorm_1.OneToMany)(() => application_component_library_entity_1.ApplicationComponentLibrary, (applicationComponentLibrary) => applicationComponentLibrary.user),
    __metadata("design:type", Array)
], User.prototype, "applicationsComponentsLibraries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => application_component_frontend_entity_1.ApplicationComponentFrontend,
        description: 'Application components frontend',
    }),
    (0, typeorm_1.OneToMany)(() => application_component_frontend_entity_1.ApplicationComponentFrontend, (applicationComponentFrontend) => applicationComponentFrontend.user),
    __metadata("design:type", Array)
], User.prototype, "applicationsComponentsFrontends", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => message_entity_1.Message,
        description: 'Messages received by the user',
    }),
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.user),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
;
//# sourceMappingURL=user.entity.js.map