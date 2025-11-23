"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const config_1 = require("@nestjs/config");
const email_module_1 = require("./email/email.module");
const throttler_1 = require("@nestjs/throttler");
const health_module_1 = require("./health/health.module");
const logger_config_1 = require("./@common/config/logger.config");
const auth_module_1 = require("./administration-by-user/auth/auth.module");
const users_module_1 = require("./administration-by-user/users/users.module");
const images_module_1 = require("./administration-by-user/images/images.module");
const portfolio_view_module_1 = require("./portfolio-view/portfolio-view.module");
const typeorm_mysql_module_1 = require("./@common/database/typeorm-mysql-module");
const messages_module_1 = require("./administration-by-user/messages/messages.module");
const dashboard_module_1 = require("./administration-by-user/dashboard/dashboard.module");
const applications_module_1 = require("./administration-by-user/applications/applications.module");
const technologies_module_1 = require("./administration-by-user/technologies/technologies.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nest_winston_1.WinstonModule.forRoot(logger_config_1.loggerConfig),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
            ]),
            auth_module_1.AuthModule,
            email_module_1.EmailModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
            images_module_1.ImagesModule,
            messages_module_1.MessagesModule,
            dashboard_module_1.DashboardModule,
            applications_module_1.ApplicationsModule,
            technologies_module_1.TechnologiesModule,
            typeorm_mysql_module_1.TypeormMysqlModule,
            portfolio_view_module_1.PortfolioViewModule,
        ],
    })
], AppModule);
;
//# sourceMappingURL=app.module.js.map