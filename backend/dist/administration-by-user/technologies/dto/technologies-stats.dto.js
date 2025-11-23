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
exports.TechnologiesStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TechnologiesStatsDto {
}
exports.TechnologiesStatsDto = TechnologiesStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 10,
        description: 'Total number of applications',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnologiesStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 10,
        description: 'Number of active applications',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnologiesStatsDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 10,
        description: 'Number of inactive applications',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TechnologiesStatsDto.prototype, "inactive", void 0);
;
//# sourceMappingURL=technologies-stats.dto.js.map