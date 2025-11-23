"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const portfolio_view_entity_1 = require("../../portfolio-view/entities/portfolio-view.entity");
const message_entity_1 = require("../../administration-by-user/messages/entities/message.entity");
const email_verification_entity_1 = require("../../portfolio-view/entities/email-verification.entity");
const conversation_entity_1 = require("../../administration-by-user/messages/entities/conversation.entity");
const technology_entity_1 = require("../../administration-by-user/technologies/entities/technology.entity");
const application_entity_1 = require("../../administration-by-user/applications/entities/application.entity");
const user_component_about_me_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-about-me.entity");
const user_component_reference_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-reference.entity");
const user_component_education_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-education.entity");
const user_component_experience_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-certificate.entity");
const application_component_api_entity_1 = require("../../administration-by-user/applications/application-components/entities/application-component-api.entity");
const user_component_about_me_highlight_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-about-me-highlight.entity");
const user_component_experience_position_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-experience-position.entity");
const application_component_mobile_entity_1 = require("../../administration-by-user/applications/application-components/entities/application-component-mobile.entity");
const application_component_library_entity_1 = require("../../administration-by-user/applications/application-components/entities/application-component-library.entity");
const application_component_frontend_entity_1 = require("../../administration-by-user/applications/application-components/entities/application-component-frontend.entity");
(0, dotenv_1.config)();
const configService = {
    get: (key, defaultValue) => {
        return process.env[key] || defaultValue;
    },
};
exports.dataSourceOptions = {
    type: 'mysql',
    entities: [
        user_entity_1.User,
        message_entity_1.Message,
        technology_entity_1.Technology,
        application_entity_1.Application,
        conversation_entity_1.Conversation,
        portfolio_view_entity_1.PortfolioView,
        email_verification_entity_1.EmailVerification,
        user_component_about_me_entity_1.UserComponentAboutMe,
        user_component_education_entity_1.UserComponentEducation,
        user_component_reference_entity_1.UserComponentReference,
        application_component_api_entity_1.ApplicationComponentApi,
        user_component_experience_entity_1.UserComponentExperience,
        user_component_certificate_entity_1.UserComponentCertificate,
        application_component_mobile_entity_1.ApplicationComponentMobile,
        application_component_library_entity_1.ApplicationComponentLibrary,
        application_component_frontend_entity_1.ApplicationComponentFrontend,
        user_component_about_me_highlight_entity_1.UserComponentAboutMeHighlight,
        user_component_experience_position_entity_1.UserComponentExperiencePosition,
    ],
    logging: true,
    synchronize: false,
    migrationsTableName: 'migrations',
    migrations: process.env.NODE_ENV === 'production'
        ? ['dist/@common/database/migrations/*.js']
        : ['src/@common/database/migrations/*.ts'],
    username: configService.get('DATABASE_USER') || 'root',
    database: configService.get('DATABASE_NAME') || 'jcoder',
    password: configService.get('DATABASE_PASSWORD') || 'password',
    host: configService.get('BACKEND_DATABASE_HOST') || 'localhost',
    port: parseInt(configService.get('BACKEND_DATABASE_PORT') || '3306'),
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map