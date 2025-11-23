"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologiesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const users_module_1 = require("../users/users.module");
const images_module_1 = require("../images/images.module");
const technology_entity_1 = require("./entities/technology.entity");
const technologies_service_1 = require("./technologies.service");
const cache_service_1 = require("../../@common/services/cache.service");
const technologies_controller_1 = require("./technologies.controller");
const create_technology_use_case_1 = require("./use-cases/create-technology.use-case");
const delete_technology_use_case_1 = require("./use-cases/delete-technology.use-case");
const update_technology_use_case_1 = require("./use-cases/update-technology.use-case");
const reorder_technology_use_case_1 = require("./use-cases/reorder-technology.use-case");
let TechnologiesModule = class TechnologiesModule {
};
exports.TechnologiesModule = TechnologiesModule;
exports.TechnologiesModule = TechnologiesModule = __decorate([
    (0, common_1.Module)({
        providers: [
            cache_service_1.CacheService,
            technologies_service_1.TechnologiesService,
            create_technology_use_case_1.CreateTechnologyUseCase,
            delete_technology_use_case_1.DeleteTechnologyUseCase,
            update_technology_use_case_1.UpdateTechnologyUseCase,
            reorder_technology_use_case_1.ReorderTechnologyUseCase,
        ],
        controllers: [technologies_controller_1.TechnologiesController],
        imports: [
            users_module_1.UsersModule,
            config_1.ConfigModule,
            images_module_1.ImagesModule,
            typeorm_1.TypeOrmModule.forFeature([technology_entity_1.Technology]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
        ],
        exports: [technologies_service_1.TechnologiesService],
    })
], TechnologiesModule);
//# sourceMappingURL=technologies.module.js.map