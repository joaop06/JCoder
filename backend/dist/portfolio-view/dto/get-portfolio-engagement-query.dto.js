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
exports.GetPortfolioEngagementQueryDto = exports.DateRangeType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DateRangeType;
(function (DateRangeType) {
    DateRangeType["DAY"] = "day";
    DateRangeType["WEEK"] = "week";
    DateRangeType["MONTH"] = "month";
    DateRangeType["YEAR"] = "year";
    DateRangeType["CUSTOM"] = "custom";
})(DateRangeType || (exports.DateRangeType = DateRangeType = {}));
class GetPortfolioEngagementQueryDto {
    constructor() {
        this.rangeType = DateRangeType.MONTH;
    }
}
exports.GetPortfolioEngagementQueryDto = GetPortfolioEngagementQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: DateRangeType,
        default: DateRangeType.MONTH,
        description: 'Date range type',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DateRangeType),
    __metadata("design:type", String)
], GetPortfolioEngagementQueryDto.prototype, "rangeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        format: 'date',
        example: '2024-01-01',
        description: 'Start date (used when rangeType is CUSTOM)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetPortfolioEngagementQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'string',
        format: 'date',
        example: '2024-01-31',
        description: 'End date (used when rangeType is CUSTOM)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetPortfolioEngagementQueryDto.prototype, "endDate", void 0);
;
//# sourceMappingURL=get-portfolio-engagement-query.dto.js.map