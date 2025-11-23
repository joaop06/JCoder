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
exports.PortfolioEngagementStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PortfolioEngagementStatsDto {
}
exports.PortfolioEngagementStatsDto = PortfolioEngagementStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 150,
        description: 'Total unique accesses in the period',
    }),
    __metadata("design:type", Number)
], PortfolioEngagementStatsDto.prototype, "totalViews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 120,
        description: 'Total unique visitors (excluding duplicates in the period)',
    }),
    __metadata("design:type", Number)
], PortfolioEngagementStatsDto.prototype, "uniqueVisitors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 30,
        description: 'Portfolio owner accesses (excluded from statistics)',
    }),
    __metadata("design:type", Number)
], PortfolioEngagementStatsDto.prototype, "ownerViews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                date: { type: 'string', example: '2024-01-15' },
                views: { type: 'number', example: 10 },
                uniqueVisitors: { type: 'number', example: 8 },
            },
        },
        description: 'Daily statistics in the period',
    }),
    __metadata("design:type", Array)
], PortfolioEngagementStatsDto.prototype, "dailyStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        properties: {
            country: { type: 'string', example: 'BR' },
            count: { type: 'number', example: 45 },
        },
        description: 'Top visitor origin countries',
    }),
    __metadata("design:type", Array)
], PortfolioEngagementStatsDto.prototype, "topCountries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        properties: {
            referer: { type: 'string', example: 'https://google.com' },
            count: { type: 'number', example: 20 },
        },
        description: 'Top referrers (traffic sources)',
    }),
    __metadata("design:type", Array)
], PortfolioEngagementStatsDto.prototype, "topReferers", void 0);
//# sourceMappingURL=portfolio-engagement-stats.dto.js.map