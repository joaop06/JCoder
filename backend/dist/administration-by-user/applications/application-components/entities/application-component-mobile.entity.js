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
exports.ApplicationComponentMobile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../users/entities/user.entity");
const application_entity_1 = require("../../entities/application.entity");
const swagger_1 = require("@nestjs/swagger");
const mobile_platform_enum_1 = require("../../enums/mobile-platform.enum");
let ApplicationComponentMobile = class ApplicationComponentMobile {
};
exports.ApplicationComponentMobile = ApplicationComponentMobile;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked application ID'
    }),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ApplicationComponentMobile.prototype, "applicationId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => application_entity_1.Application, (application) => application.applicationComponentMobile, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'applicationId' }),
    __metadata("design:type", application_entity_1.Application)
], ApplicationComponentMobile.prototype, "application", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], ApplicationComponentMobile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.applicationsComponentsMobiles, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ApplicationComponentMobile.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        enum: mobile_platform_enum_1.MobilePlatformEnum,
        example: mobile_platform_enum_1.MobilePlatformEnum.ANDROID,
        description: 'Type of platform on which the mobile application was developed',
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        nullable: false,
        enum: mobile_platform_enum_1.MobilePlatformEnum,
    }),
    __metadata("design:type", String)
], ApplicationComponentMobile.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        description: 'URL to download the application',
        example: 'https://example.mobile.com/download/1.1.0',
    }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApplicationComponentMobile.prototype, "downloadUrl", void 0);
exports.ApplicationComponentMobile = ApplicationComponentMobile = __decorate([
    (0, typeorm_1.Entity)('applications_components_mobiles')
], ApplicationComponentMobile);
;
//# sourceMappingURL=application-component-mobile.entity.js.map