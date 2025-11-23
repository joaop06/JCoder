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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const applications_stats_dto_1 = require("../applications/dto/applications-stats.dto");
const technologies_stats_dto_1 = require("../technologies/dto/technologies-stats.dto");
const portfolio_engagement_stats_dto_1 = require("./dto/portfolio-engagement-stats.dto");
const dashboard_response_dto_1 = require("./dto/dashboard-response.dto");
const get_applications_stats_use_case_1 = require("./use-cases/get-applications-stats.use-case");
const get_technologies_stats_use_case_1 = require("./use-cases/get-technologies-stats.use-case");
const get_profile_completeness_use_case_1 = require("./use-cases/get-profile-completeness.use-case");
const get_unread_messages_stats_use_case_1 = require("./use-cases/get-unread-messages-stats.use-case");
const get_portfolio_engagement_stats_use_case_1 = require("./use-cases/get-portfolio-engagement-stats.use-case");
const get_portfolio_engagement_query_dto_1 = require("../../portfolio-view/dto/get-portfolio-engagement-query.dto");
let DashboardController = class DashboardController {
    constructor(getApplicationsStatsUseCase, getTechnologiesStatsUseCase, getUnreadMessagesStatsUseCase, getProfileCompletenessUseCase, getPortfolioEngagementStatsUseCase) {
        this.getApplicationsStatsUseCase = getApplicationsStatsUseCase;
        this.getTechnologiesStatsUseCase = getTechnologiesStatsUseCase;
        this.getUnreadMessagesStatsUseCase = getUnreadMessagesStatsUseCase;
        this.getProfileCompletenessUseCase = getProfileCompletenessUseCase;
        this.getPortfolioEngagementStatsUseCase = getPortfolioEngagementStatsUseCase;
    }
    async getApplicationsStats(username) {
        return await this.getApplicationsStatsUseCase.execute(username);
    }
    async getTechnologiesStats(username) {
        return await this.getTechnologiesStatsUseCase.execute(username);
    }
    async getUnreadMessagesStats(username) {
        return await this.getUnreadMessagesStatsUseCase.execute(username);
    }
    async getProfileCompleteness(username) {
        return await this.getProfileCompletenessUseCase.execute(username);
    }
    async getPortfolioEngagementStats(username, query) {
        return await this.getPortfolioEngagementStatsUseCase.execute(username, query);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('applications/stats'),
    (0, swagger_1.ApiOkResponse)({ type: applications_stats_dto_1.ApplicationsStatsDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getApplicationsStats", null);
__decorate([
    (0, common_1.Get)('technologies/stats'),
    (0, swagger_1.ApiOkResponse)({ type: technologies_stats_dto_1.TechnologiesStatsDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTechnologiesStats", null);
__decorate([
    (0, common_1.Get)('messages/unread'),
    (0, swagger_1.ApiOkResponse)({ type: dashboard_response_dto_1.UnreadMessagesDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUnreadMessagesStats", null);
__decorate([
    (0, common_1.Get)('profile/completeness'),
    (0, swagger_1.ApiOkResponse)({ type: dashboard_response_dto_1.ProfileCompletenessDto }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getProfileCompleteness", null);
__decorate([
    (0, common_1.Get)('engagement/stats'),
    (0, swagger_1.ApiOkResponse)({ type: portfolio_engagement_stats_dto_1.PortfolioEngagementStatsDto }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_portfolio_engagement_query_dto_1.GetPortfolioEngagementQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPortfolioEngagementStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':username/dashboard'),
    (0, swagger_1.ApiTags)('Administration Dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [get_applications_stats_use_case_1.GetApplicationsStatsUseCase,
        get_technologies_stats_use_case_1.GetTechnologiesStatsUseCase,
        get_unread_messages_stats_use_case_1.GetUnreadMessagesStatsUseCase,
        get_profile_completeness_use_case_1.GetProfileCompletenessUseCase,
        get_portfolio_engagement_stats_use_case_1.GetPortfolioEngagementStatsUseCase])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map