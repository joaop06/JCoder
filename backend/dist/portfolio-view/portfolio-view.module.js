"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioViewModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const email_module_1 = require("../email/email.module");
const cache_service_1 = require("../@common/services/cache.service");
const portfolio_view_entity_1 = require("./entities/portfolio-view.entity");
const create_user_use_case_1 = require("./use-cases/create-user.use-case");
const portfolio_view_controller_1 = require("./portfolio-view.controller");
const email_verification_entity_1 = require("./entities/email-verification.entity");
const get_educations_use_case_1 = require("./use-cases/get-educations.use-case");
const users_module_1 = require("../administration-by-user/users/users.module");
const get_references_use_case_1 = require("./use-cases/get-references.use-case");
const user_entity_1 = require("../administration-by-user/users/entities/user.entity");
const get_experiences_use_case_1 = require("./use-cases/get-experiences.use-case");
const get_certificates_use_case_1 = require("./use-cases/get-certificates.use-case");
const get_applications_use_case_1 = require("./use-cases/get-applications.use-case");
const get_technologies_use_case_1 = require("./use-cases/get-technologies.use-case");
const verify_email_code_use_case_1 = require("./use-cases/verify-email-code.use-case");
const messages_module_1 = require("../administration-by-user/messages/messages.module");
const get_application_details_use_case_1 = require("./use-cases/get-application-details.use-case");
const register_portfolio_view_use_case_1 = require("./use-cases/register-portfolio-view.use-case");
const send_email_verification_use_case_1 = require("./use-cases/send-email-verification.use-case");
const check_email_availability_use_case_1 = require("./use-cases/check-email-availability.use-case");
const get_profile_with_about_me_use_case_1 = require("./use-cases/get-profile-with-about-me.use-case");
const technology_entity_1 = require("../administration-by-user/technologies/entities/technology.entity");
const application_entity_1 = require("../administration-by-user/applications/entities/application.entity");
const check_username_availability_use_case_1 = require("./use-cases/check-username-availability.use-case");
const user_component_about_me_entity_1 = require("../administration-by-user/users/user-components/entities/user-component-about-me.entity");
const user_component_education_entity_1 = require("../administration-by-user/users/user-components/entities/user-component-education.entity");
const user_component_reference_entity_1 = require("../administration-by-user/users/user-components/entities/user-component-reference.entity");
const user_component_experience_entity_1 = require("../administration-by-user/users/user-components/entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("../administration-by-user/users/user-components/entities/user-component-certificate.entity");
let PortfolioViewModule = class PortfolioViewModule {
};
exports.PortfolioViewModule = PortfolioViewModule;
exports.PortfolioViewModule = PortfolioViewModule = __decorate([
    (0, common_1.Module)({
        providers: [
            cache_service_1.CacheService,
            create_user_use_case_1.CreateUserUseCase,
            get_educations_use_case_1.GetEducationsUseCase,
            get_experiences_use_case_1.GetExperiencesUseCase,
            get_applications_use_case_1.GetApplicationsUseCase,
            get_certificates_use_case_1.GetCertificatesUseCase,
            get_references_use_case_1.GetReferencesUseCase,
            get_technologies_use_case_1.GetTechnologiesUseCase,
            verify_email_code_use_case_1.VerifyEmailCodeUseCase,
            get_application_details_use_case_1.GetApplicationDetailsUseCase,
            get_profile_with_about_me_use_case_1.GetProfileWithAboutMeUseCase,
            send_email_verification_use_case_1.SendEmailVerificationUseCase,
            check_email_availability_use_case_1.CheckEmailAvailabilityUseCase,
            check_username_availability_use_case_1.CheckUsernameAvailabilityUseCase,
            register_portfolio_view_use_case_1.RegisterPortfolioViewUseCase,
        ],
        controllers: [
            portfolio_view_controller_1.PortfolioViewController,
        ],
        imports: [
            email_module_1.EmailModule,
            users_module_1.UsersModule,
            config_1.ConfigModule,
            messages_module_1.MessagesModule,
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                technology_entity_1.Technology,
                application_entity_1.Application,
                email_verification_entity_1.EmailVerification,
                portfolio_view_entity_1.PortfolioView,
                user_component_about_me_entity_1.UserComponentAboutMe,
                user_component_education_entity_1.UserComponentEducation,
                user_component_experience_entity_1.UserComponentExperience,
                user_component_certificate_entity_1.UserComponentCertificate,
                user_component_reference_entity_1.UserComponentReference,
            ]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
        ],
    })
], PortfolioViewModule);
;
//# sourceMappingURL=portfolio-view.module.js.map