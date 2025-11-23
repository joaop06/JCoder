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
exports.ApplicationComponentsDto = exports.CreateComponentsForTypeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../../users/entities/user.entity");
const application_entity_1 = require("../../entities/application.entity");
const swagger_1 = require("@nestjs/swagger");
const application_type_enum_1 = require("../../enums/application-type.enum");
const application_component_api_dto_1 = require("./application-component-api.dto");
const application_component_mobile_dto_1 = require("./application-component-mobile.dto");
const application_component_library_dto_1 = require("./application-component-library.dto");
const application_component_frontend_dto_1 = require("./application-component-frontend.dto");
class CreateComponentsForTypeDto {
}
exports.CreateComponentsForTypeDto = CreateComponentsForTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        type: () => user_entity_1.User,
        description: 'User record to be linked with components',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", user_entity_1.User)
], CreateComponentsForTypeDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        type: () => application_entity_1.Application,
        description: 'Application record to be linked with components',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => application_entity_1.Application),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_entity_1.Application)
], CreateComponentsForTypeDto.prototype, "application", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        type: () => ApplicationComponentsDto,
        description: 'Components composition from the application',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => ApplicationComponentsDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", ApplicationComponentsDto)
], CreateComponentsForTypeDto.prototype, "dtos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        required: false,
        nullable: true,
        enum: application_type_enum_1.ApplicationTypeEnum,
        example: application_type_enum_1.ApplicationTypeEnum.API,
        description: 'Application type (optional, kept for backward compatibility)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(application_type_enum_1.ApplicationTypeEnum),
    __metadata("design:type", String)
], CreateComponentsForTypeDto.prototype, "applicationType", void 0);
;
class ApplicationComponentsDto {
}
exports.ApplicationComponentsDto = ApplicationComponentsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_api_dto_1.ApplicationComponentApiDto,
        description: 'API application type component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_api_dto_1.ApplicationComponentApiDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_api_dto_1.ApplicationComponentApiDto)
], ApplicationComponentsDto.prototype, "applicationComponentApi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_mobile_dto_1.ApplicationComponentMobileDto,
        description: 'Mobile application type component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_mobile_dto_1.ApplicationComponentMobileDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_mobile_dto_1.ApplicationComponentMobileDto)
], ApplicationComponentsDto.prototype, "applicationComponentMobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_library_dto_1.ApplicationComponentLibraryDto,
        description: 'Library application type component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_library_dto_1.ApplicationComponentLibraryDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_library_dto_1.ApplicationComponentLibraryDto)
], ApplicationComponentsDto.prototype, "applicationComponentLibrary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        type: () => application_component_frontend_dto_1.ApplicationComponentFrontendDto,
        description: 'Frontend application type component',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => application_component_frontend_dto_1.ApplicationComponentFrontendDto),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", application_component_frontend_dto_1.ApplicationComponentFrontendDto)
], ApplicationComponentsDto.prototype, "applicationComponentFrontend", void 0);
;
//# sourceMappingURL=create-components-for-type.dto.js.map