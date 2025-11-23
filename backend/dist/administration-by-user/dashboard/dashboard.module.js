"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const users_module_1 = require("../users/users.module");
const user_entity_1 = require("../users/entities/user.entity");
const dashboard_controller_1 = require("./dashboard.controller");
const messages_module_1 = require("../messages/messages.module");
const message_entity_1 = require("../messages/entities/message.entity");
const cache_service_1 = require("../../@common/services/cache.service");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
const applications_module_1 = require("../applications/applications.module");
const technologies_module_1 = require("../technologies/technologies.module");
const portfolio_view_entity_1 = require("../../portfolio-view/entities/portfolio-view.entity");
const get_applications_stats_use_case_1 = require("./use-cases/get-applications-stats.use-case");
const get_technologies_stats_use_case_1 = require("./use-cases/get-technologies-stats.use-case");
const get_profile_completeness_use_case_1 = require("./use-cases/get-profile-completeness.use-case");
const get_unread_messages_stats_use_case_1 = require("./use-cases/get-unread-messages-stats.use-case");
const user_component_about_me_entity_1 = require("../users/user-components/entities/user-component-about-me.entity");
const get_portfolio_engagement_stats_use_case_1 = require("./use-cases/get-portfolio-engagement-stats.use-case");
const user_component_education_entity_1 = require("../users/user-components/entities/user-component-education.entity");
const user_component_reference_entity_1 = require("../users/user-components/entities/user-component-reference.entity");
const user_component_experience_entity_1 = require("../users/user-components/entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("../users/user-components/entities/user-component-certificate.entity");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            messages_module_1.MessagesModule,
            applications_module_1.ApplicationsModule,
            technologies_module_1.TechnologiesModule,
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                message_entity_1.Message,
                conversation_entity_1.Conversation,
                portfolio_view_entity_1.PortfolioView,
                user_component_about_me_entity_1.UserComponentAboutMe,
                user_component_education_entity_1.UserComponentEducation,
                user_component_reference_entity_1.UserComponentReference,
                user_component_experience_entity_1.UserComponentExperience,
                user_component_certificate_entity_1.UserComponentCertificate,
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [
            cache_service_1.CacheService,
            get_applications_stats_use_case_1.GetApplicationsStatsUseCase,
            get_technologies_stats_use_case_1.GetTechnologiesStatsUseCase,
            get_unread_messages_stats_use_case_1.GetUnreadMessagesStatsUseCase,
            get_profile_completeness_use_case_1.GetProfileCompletenessUseCase,
            get_portfolio_engagement_stats_use_case_1.GetPortfolioEngagementStatsUseCase,
        ],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map