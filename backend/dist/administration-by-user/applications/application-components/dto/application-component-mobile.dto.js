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
exports.ApplicationComponentMobileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const mobile_platform_enum_1 = require("../../enums/mobile-platform.enum");
class ApplicationComponentMobileDto {
}
exports.ApplicationComponentMobileDto = ApplicationComponentMobileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        nullable: false,
        enum: mobile_platform_enum_1.MobilePlatformEnum,
        example: mobile_platform_enum_1.MobilePlatformEnum.ANDROID,
        description: 'Type of platform on which the mobile application was developed',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(mobile_platform_enum_1.MobilePlatformEnum),
    __metadata("design:type", String)
], ApplicationComponentMobileDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        nullable: true,
        required: false,
        description: 'URL to download the application',
        example: 'https://example.mobile.com/download/1.1.0',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ApplicationComponentMobileDto.prototype, "downloadUrl", void 0);
;
//# sourceMappingURL=application-component-mobile.dto.js.map