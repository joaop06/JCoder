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
exports.DashboardResponseDto = exports.UnreadMessagesDto = exports.ProfileCompletenessDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const applications_stats_dto_1 = require("../../applications/dto/applications-stats.dto");
const technologies_stats_dto_1 = require("../../technologies/dto/technologies-stats.dto");
class ProfileCompletenessDto {
}
exports.ProfileCompletenessDto = ProfileCompletenessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 75,
        description: 'Profile completeness percentage (0-100)',
    }),
    __metadata("design:type", Number)
], ProfileCompletenessDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 6,
        description: 'Number of completed fields',
    }),
    __metadata("design:type", Number)
], ProfileCompletenessDto.prototype, "completedFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 8,
        description: 'Total number of fields',
    }),
    __metadata("design:type", Number)
], ProfileCompletenessDto.prototype, "totalFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        description: 'Details of each field completion status',
        example: {
            profileImage: true,
            fullName: true,
            email: true,
            phone: false,
            address: false,
            githubUrl: true,
            linkedinUrl: true,
            aboutMe: true,
            education: false,
            experience: true,
            certificates: false,
            references: false,
        },
    }),
    __metadata("design:type", Object)
], ProfileCompletenessDto.prototype, "fields", void 0);
class UnreadMessagesDto {
}
exports.UnreadMessagesDto = UnreadMessagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 5,
        description: 'Total number of unread messages',
    }),
    __metadata("design:type", Number)
], UnreadMessagesDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        example: 3,
        description: 'Number of conversations with unread messages',
    }),
    __metadata("design:type", Number)
], UnreadMessagesDto.prototype, "conversations", void 0);
class DashboardResponseDto {
}
exports.DashboardResponseDto = DashboardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => applications_stats_dto_1.ApplicationsStatsDto,
        description: 'Applications statistics',
    }),
    __metadata("design:type", applications_stats_dto_1.ApplicationsStatsDto)
], DashboardResponseDto.prototype, "applications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => technologies_stats_dto_1.TechnologiesStatsDto,
        description: 'Technologies statistics',
    }),
    __metadata("design:type", technologies_stats_dto_1.TechnologiesStatsDto)
], DashboardResponseDto.prototype, "technologies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => UnreadMessagesDto,
        description: 'Unread messages statistics',
    }),
    __metadata("design:type", UnreadMessagesDto)
], DashboardResponseDto.prototype, "unreadMessages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => ProfileCompletenessDto,
        description: 'Profile completeness information',
    }),
    __metadata("design:type", ProfileCompletenessDto)
], DashboardResponseDto.prototype, "profileCompleteness", void 0);
//# sourceMappingURL=dashboard-response.dto.js.map