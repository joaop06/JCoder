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
exports.CreateApplicationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const application_type_enum_1 = require("../enums/application-type.enum");
const application_component_api_dto_1 = require("../application-components/dto/application-component-api.dto");
const application_component_mobile_dto_1 = require("../application-components/dto/application-component-mobile.dto");
const application_component_library_dto_1 = require("../application-components/dto/application-component-library.dto");
const application_component_frontend_dto_1 = require("../application-components/dto/application-component-frontend.dto");
class CreateApplicationDto {
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        required: true,
        nullable: false,
        example: 1,
        description: 'User ID',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        nullable: false,
        example: 'Any Name',
        description: 'Your application name',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: true,
        nullable: false,
        example: 'This is the first application',
        description: 'A simplified description of the application',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        required: false,
        nullable: true,
        enum: application_type_enum_1.ApplicationTypeEnum,
        example: application_type_enum_1.ApplicationTypeEnum.API,
        description: 'Application type (optional, kept for backward compatibility)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(application_type_enum_1.ApplicationTypeEnum),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "applicationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        type: 'string',
        required: false,
        example: 'https://github.com/user/your-application',
        description: 'GitHub URL to access the repository',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "githubUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_api_dto_1.ApplicationComponentApiDto,
        description: 'API application component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_api_dto_1.ApplicationComponentApiDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_api_dto_1.ApplicationComponentApiDto)
], CreateApplicationDto.prototype, "applicationComponentApi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_mobile_dto_1.ApplicationComponentMobileDto,
        description: 'Mobile application component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_mobile_dto_1.ApplicationComponentMobileDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_mobile_dto_1.ApplicationComponentMobileDto)
], CreateApplicationDto.prototype, "applicationComponentMobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_library_dto_1.ApplicationComponentLibraryDto,
        description: 'Library application component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_library_dto_1.ApplicationComponentLibraryDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_library_dto_1.ApplicationComponentLibraryDto)
], CreateApplicationDto.prototype, "applicationComponentLibrary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_frontend_dto_1.ApplicationComponentFrontendDto,
        description: 'Frontend application component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_frontend_dto_1.ApplicationComponentFrontendDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_frontend_dto_1.ApplicationComponentFrontendDto)
], CreateApplicationDto.prototype, "applicationComponentFrontend", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: [Number],
        example: [1, 2, 3],
        description: 'Array of technology IDs to associate with the application',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateApplicationDto.prototype, "technologyIds", void 0);
;
//# sourceMappingURL=create-application.dto.js.map