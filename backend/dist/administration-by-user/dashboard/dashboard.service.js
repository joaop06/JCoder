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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const get_applications_stats_use_case_1 = require("./use-cases/get-applications-stats.use-case");
const get_technologies_stats_use_case_1 = require("./use-cases/get-technologies-stats.use-case");
const get_unread_messages_stats_use_case_1 = require("./use-cases/get-unread-messages-stats.use-case");
const get_profile_completeness_use_case_1 = require("./use-cases/get-profile-completeness.use-case");
let DashboardService = class DashboardService {
    constructor(getApplicationsStatsUseCase, getTechnologiesStatsUseCase, getUnreadMessagesStatsUseCase, getProfileCompletenessUseCase) {
        this.getApplicationsStatsUseCase = getApplicationsStatsUseCase;
        this.getTechnologiesStatsUseCase = getTechnologiesStatsUseCase;
        this.getUnreadMessagesStatsUseCase = getUnreadMessagesStatsUseCase;
        this.getProfileCompletenessUseCase = getProfileCompletenessUseCase;
    }
    async getDashboardData(username) {
        const [applications, technologies, unreadMessages, profileCompleteness] = await Promise.all([
            this.getApplicationsStatsUseCase.execute(username),
            this.getTechnologiesStatsUseCase.execute(username),
            this.getUnreadMessagesStatsUseCase.execute(username),
            this.getProfileCompletenessUseCase.execute(username),
        ]);
        return {
            applications,
            technologies,
            unreadMessages,
            profileCompleteness,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [get_applications_stats_use_case_1.GetApplicationsStatsUseCase,
        get_technologies_stats_use_case_1.GetTechnologiesStatsUseCase,
        get_unread_messages_stats_use_case_1.GetUnreadMessagesStatsUseCase,
        get_profile_completeness_use_case_1.GetProfileCompletenessUseCase])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map