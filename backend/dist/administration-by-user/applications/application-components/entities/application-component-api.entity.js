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
exports.ApplicationComponentApi = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../users/entities/user.entity");
const application_entity_1 = require("../../entities/application.entity");
const swagger_1 = require("@nestjs/swagger");
let ApplicationComponentApi = class ApplicationComponentApi {
};
exports.ApplicationComponentApi = ApplicationComponentApi;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked application ID'
    }),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ApplicationComponentApi.prototype, "applicationId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => application_entity_1.Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'applicationId' }),
    __metadata("design:type", application_entity_1.Application)
], ApplicationComponentApi.prototype, "application", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], ApplicationComponentApi.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.applicationsComponentsApis, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ApplicationComponentApi.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        example: 'example.api.com',
        description: 'Hosted API domains',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ApplicationComponentApi.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        example: 'https://example.api.com/api/v1',
        description: 'Route to consume the application',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ApplicationComponentApi.prototype, "apiUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        example: 'https://example.api.com/docs',
        description: 'Path to verify application documentation',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApplicationComponentApi.prototype, "documentationUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        example: 'https://example.api.com/health',
        description: 'Route to check application health',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApplicationComponentApi.prototype, "healthCheckEndpoint", void 0);
exports.ApplicationComponentApi = ApplicationComponentApi = __decorate([
    (0, typeorm_1.Entity)('applications_components_apis')
], ApplicationComponentApi);
;
//# sourceMappingURL=application-component-api.entity.js.map