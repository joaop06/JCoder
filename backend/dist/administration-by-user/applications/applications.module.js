"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const users_module_1 = require("../users/users.module");
const images_module_1 = require("../images/images.module");
const application_entity_1 = require("./entities/application.entity");
const applications_service_1 = require("./applications.service");
const cache_service_1 = require("../../@common/services/cache.service");
const applications_controller_1 = require("./applications.controller");
const technology_entity_1 = require("../technologies/entities/technology.entity");
const create_application_use_case_1 = require("./use-cases/create-application.use-case");
const delete_application_use_case_1 = require("./use-cases/delete-application.use-case");
const update_application_use_case_1 = require("./use-cases/update-application.use-case");
const reorder_application_use_case_1 = require("./use-cases/reorder-application.use-case");
const application_components_module_1 = require("./application-components/application-components.module");
const delete_application_component_use_case_1 = require("./use-cases/delete-application-component.use-case");
let ApplicationsModule = class ApplicationsModule {
};
exports.ApplicationsModule = ApplicationsModule;
exports.ApplicationsModule = ApplicationsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            cache_service_1.CacheService,
            applications_service_1.ApplicationsService,
            create_application_use_case_1.CreateApplicationUseCase,
            delete_application_use_case_1.DeleteApplicationUseCase,
            update_application_use_case_1.UpdateApplicationUseCase,
            reorder_application_use_case_1.ReorderApplicationUseCase,
            delete_application_component_use_case_1.DeleteApplicationComponentUseCase,
        ],
        exports: [applications_service_1.ApplicationsService],
        controllers: [applications_controller_1.ApplicationsController],
        imports: [
            users_module_1.UsersModule,
            config_1.ConfigModule,
            images_module_1.ImagesModule,
            application_components_module_1.ApplicationComponentsModule,
            typeorm_1.TypeOrmModule.forFeature([application_entity_1.Application, technology_entity_1.Technology]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
        ],
    })
], ApplicationsModule);
//# sourceMappingURL=applications.module.js.map