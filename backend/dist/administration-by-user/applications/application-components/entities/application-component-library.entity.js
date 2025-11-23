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
exports.ApplicationComponentLibrary = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../users/entities/user.entity");
const application_entity_1 = require("../../entities/application.entity");
const swagger_1 = require("@nestjs/swagger");
let ApplicationComponentLibrary = class ApplicationComponentLibrary {
};
exports.ApplicationComponentLibrary = ApplicationComponentLibrary;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked application ID'
    }),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ApplicationComponentLibrary.prototype, "applicationId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => application_entity_1.Application, (application) => application.applicationComponentLibrary, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'applicationId' }),
    __metadata("design:type", application_entity_1.Application)
], ApplicationComponentLibrary.prototype, "application", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], ApplicationComponentLibrary.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.applicationsComponentsLibraries, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ApplicationComponentLibrary.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        nullable: false,
        description: 'URL of the library package manager',
        example: 'https://www.npmjs.com/package/your-package',
    }),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ApplicationComponentLibrary.prototype, "packageManagerUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        description: 'Library README contents',
    }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ApplicationComponentLibrary.prototype, "readmeContent", void 0);
exports.ApplicationComponentLibrary = ApplicationComponentLibrary = __decorate([
    (0, typeorm_1.Entity)('applications_components_libraries')
], ApplicationComponentLibrary);
;
//# sourceMappingURL=application-component-library.entity.js.map