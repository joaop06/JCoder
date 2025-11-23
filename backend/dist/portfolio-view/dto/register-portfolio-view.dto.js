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
exports.RegisterPortfolioViewDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterPortfolioViewDto {
}
exports.RegisterPortfolioViewDto = RegisterPortfolioViewDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        example: 'abc123def456',
        description: 'Unique browser fingerprint for deduplication',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterPortfolioViewDto.prototype, "fingerprint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        example: 'https://example.com',
        description: 'Referrer URL (where it came from)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterPortfolioViewDto.prototype, "referer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'boolean',
        default: false,
        description: 'Indicates if the access was from the portfolio owner (via cookie/localStorage)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterPortfolioViewDto.prototype, "isOwner", void 0);
;
//# sourceMappingURL=register-portfolio-view.dto.js.map