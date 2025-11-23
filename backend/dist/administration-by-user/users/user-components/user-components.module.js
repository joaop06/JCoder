"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserComponentsModule = void 0;
const about_me_use_case_1 = require("./use-cases/about-me.use-case");
const certificate_use_case_1 = require("./use-cases/certificate.use-case");
const education_use_case_1 = require("./use-cases/education.use-case");
const experience_use_case_1 = require("./use-cases/experience.use-case");
const users_module_1 = require("../users.module");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_service_1 = require("../../../@common/services/cache.service");
const about_me_repository_1 = require("./repositories/about-me.repository");
const education_repository_1 = require("./repositories/education.repository");
const experience_repository_1 = require("./repositories/experience.repository");
const certificate_repository_1 = require("./repositories/certificate.repository");
const reference_repository_1 = require("./repositories/reference.repository");
const user_component_about_me_entity_1 = require("./entities/user-component-about-me.entity");
const user_component_education_entity_1 = require("./entities/user-component-education.entity");
const user_components_repository_1 = require("./repositories/user-components.repository");
const user_component_experience_entity_1 = require("./entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("./entities/user-component-certificate.entity");
const link_certificate_education_use_case_1 = require("./use-cases/link-certificate-education.use-case");
const user_component_about_me_highlight_entity_1 = require("./entities/user-component-about-me-highlight.entity");
const user_component_experience_position_entity_1 = require("./entities/user-component-experience-position.entity");
const user_component_reference_entity_1 = require("./entities/user-component-reference.entity");
const unlink_certificate_education_use_case_1 = require("./use-cases/unlink-certificate-education.use-case");
const reference_use_case_1 = require("./use-cases/reference.use-case");
let UserComponentsModule = class UserComponentsModule {
};
exports.UserComponentsModule = UserComponentsModule;
exports.UserComponentsModule = UserComponentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_component_about_me_entity_1.UserComponentAboutMe,
                user_component_education_entity_1.UserComponentEducation,
                user_component_experience_entity_1.UserComponentExperience,
                user_component_certificate_entity_1.UserComponentCertificate,
                user_component_reference_entity_1.UserComponentReference,
                user_component_about_me_highlight_entity_1.UserComponentAboutMeHighlight,
                user_component_experience_position_entity_1.UserComponentExperiencePosition,
            ]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        exports: [
            about_me_use_case_1.GetAboutMeUseCase,
            about_me_use_case_1.UpdateAboutMeUseCase,
            education_use_case_1.GetEducationsUseCase,
            education_use_case_1.CreateEducationUseCase,
            education_use_case_1.DeleteEducationUseCase,
            education_use_case_1.UpdateEducationUseCase,
            experience_use_case_1.GetExperiencesUseCase,
            experience_use_case_1.CreateExperienceUseCase,
            experience_use_case_1.DeleteExperienceUseCase,
            experience_use_case_1.UpdateExperienceUseCase,
            certificate_use_case_1.GetCertificatesUseCase,
            certificate_use_case_1.CreateCertificateUseCase,
            certificate_use_case_1.DeleteCertificateUseCase,
            certificate_use_case_1.UpdateCertificateUseCase,
            link_certificate_education_use_case_1.LinkCertificateToEducationUseCase,
            unlink_certificate_education_use_case_1.UnlinkCertificateFromEducationUseCase,
            reference_use_case_1.GetReferencesUseCase,
            reference_use_case_1.CreateReferenceUseCase,
            reference_use_case_1.DeleteReferenceUseCase,
            reference_use_case_1.UpdateReferenceUseCase,
        ],
        providers: [
            cache_service_1.CacheService,
            about_me_repository_1.AboutMeRepository,
            education_repository_1.EducationRepository,
            experience_repository_1.ExperienceRepository,
            certificate_repository_1.CertificateRepository,
            reference_repository_1.ReferenceRepository,
            user_components_repository_1.UserComponentsRepository,
            about_me_use_case_1.GetAboutMeUseCase,
            about_me_use_case_1.UpdateAboutMeUseCase,
            education_use_case_1.GetEducationsUseCase,
            education_use_case_1.CreateEducationUseCase,
            education_use_case_1.DeleteEducationUseCase,
            education_use_case_1.UpdateEducationUseCase,
            experience_use_case_1.GetExperiencesUseCase,
            experience_use_case_1.CreateExperienceUseCase,
            experience_use_case_1.DeleteExperienceUseCase,
            experience_use_case_1.UpdateExperienceUseCase,
            certificate_use_case_1.GetCertificatesUseCase,
            certificate_use_case_1.CreateCertificateUseCase,
            certificate_use_case_1.DeleteCertificateUseCase,
            certificate_use_case_1.UpdateCertificateUseCase,
            link_certificate_education_use_case_1.LinkCertificateToEducationUseCase,
            unlink_certificate_education_use_case_1.UnlinkCertificateFromEducationUseCase,
            reference_use_case_1.GetReferencesUseCase,
            reference_use_case_1.CreateReferenceUseCase,
            reference_use_case_1.DeleteReferenceUseCase,
            reference_use_case_1.UpdateReferenceUseCase,
        ],
    })
], UserComponentsModule);
;
//# sourceMappingURL=user-components.module.js.map