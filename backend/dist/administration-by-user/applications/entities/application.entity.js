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
exports.Application = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
const application_type_enum_1 = require("../enums/application-type.enum");
const technology_entity_1 = require("../../technologies/entities/technology.entity");
const application_component_api_entity_1 = require("../application-components/entities/application-component-api.entity");
const application_component_mobile_entity_1 = require("../application-components/entities/application-component-mobile.entity");
const application_component_library_entity_1 = require("../application-components/entities/application-component-library.entity");
const application_component_frontend_entity_1 = require("../application-components/entities/application-component-frontend.entity");
let Application = class Application {
};
exports.Application = Application;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Application.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Application.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.applications, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Application.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'Any Name',
    }),
    (0, typeorm_1.Column)({ unique: false }),
    __metadata("design:type", String)
], Application.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: false,
        example: 'This is the first application',
    }),
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Application.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        nullable: true,
        enum: application_type_enum_1.ApplicationTypeEnum,
        example: application_type_enum_1.ApplicationTypeEnum.API,
        description: 'Application type (optional, kept for backward compatibility)',
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        nullable: true,
        enum: application_type_enum_1.ApplicationTypeEnum,
    }),
    __metadata("design:type", String)
], Application.prototype, "applicationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        example: 'https://github.com/user/your-application',
        description: 'GitHub URL to access the repository',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Application.prototype, "githubUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: true,
        example: true,
        nullable: false,
        type: 'boolean',
        description: 'Indicates whether the application is active',
    }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Application.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'array',
        items: { type: 'string' },
        example: ['image1.jpg', 'image2.png'],
        description: 'Array of image filenames associated with the application',
    }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Application.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        example: 'profile-logo.png',
        description: 'Profile image filename for the application (logo, icon, etc.)',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Application.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Display order for sorting applications (lower numbers appear first)',
    }),
    (0, typeorm_1.Column)({ nullable: false, default: 1 }),
    __metadata("design:type", Number)
], Application.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => application_component_api_entity_1.ApplicationComponentApi,
        description: 'API application component',
    }),
    (0, typeorm_1.OneToOne)(() => application_component_api_entity_1.ApplicationComponentApi, (applicationComponentApi) => applicationComponentApi.application),
    __metadata("design:type", application_component_api_entity_1.ApplicationComponentApi)
], Application.prototype, "applicationComponentApi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => application_component_mobile_entity_1.ApplicationComponentMobile,
        description: 'Mobile application component',
    }),
    (0, typeorm_1.OneToOne)(() => application_component_mobile_entity_1.ApplicationComponentMobile, (applicationComponentMobile) => applicationComponentMobile.application),
    __metadata("design:type", application_component_mobile_entity_1.ApplicationComponentMobile)
], Application.prototype, "applicationComponentMobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => application_component_library_entity_1.ApplicationComponentLibrary,
        description: 'Library application component',
    }),
    (0, typeorm_1.OneToOne)(() => application_component_library_entity_1.ApplicationComponentLibrary, (applicationComponentLibrary) => applicationComponentLibrary.application),
    __metadata("design:type", application_component_library_entity_1.ApplicationComponentLibrary)
], Application.prototype, "applicationComponentLibrary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: () => application_component_frontend_entity_1.ApplicationComponentFrontend,
        description: 'Frontend application component',
    }),
    (0, typeorm_1.OneToOne)(() => application_component_frontend_entity_1.ApplicationComponentFrontend, (applicationComponentFrontend) => applicationComponentFrontend.application),
    __metadata("design:type", application_component_frontend_entity_1.ApplicationComponentFrontend)
], Application.prototype, "applicationComponentFrontend", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        nullable: true,
        type: () => technology_entity_1.Technology,
        description: 'Technologies associated with this application',
    }),
    (0, typeorm_1.ManyToMany)(() => technology_entity_1.Technology, (technology) => technology.applications, { eager: false }),
    (0, typeorm_1.JoinTable)({
        name: 'applications_technologies',
        joinColumn: { name: 'applicationId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'technologyId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Application.prototype, "technologies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        type: () => Date,
        example: new Date(),
    }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        required: false,
        type: () => Date,
    }),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "deletedAt", void 0);
exports.Application = Application = __decorate([
    (0, typeorm_1.Entity)('applications'),
    (0, typeorm_1.Unique)(['name', 'userId'])
], Application);
;
//# sourceMappingURL=application.entity.js.map