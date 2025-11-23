"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationComponentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const application_components_service_1 = require("./application-components.service");
const application_componets_reposiotry_1 = require("./application-componets.reposiotry");
const application_component_api_entity_1 = require("./entities/application-component-api.entity");
const application_component_mobile_entity_1 = require("./entities/application-component-mobile.entity");
const application_component_library_entity_1 = require("./entities/application-component-library.entity");
const application_component_frontend_entity_1 = require("./entities/application-component-frontend.entity");
let ApplicationComponentsModule = class ApplicationComponentsModule {
};
exports.ApplicationComponentsModule = ApplicationComponentsModule;
exports.ApplicationComponentsModule = ApplicationComponentsModule = __decorate([
    (0, common_1.Module)({
        exports: [
            application_components_service_1.ApplicationComponentsService,
        ],
        providers: [
            application_components_service_1.ApplicationComponentsService,
            application_componets_reposiotry_1.ApplicationComponentsRepository,
        ],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                application_component_api_entity_1.ApplicationComponentApi,
                application_component_mobile_entity_1.ApplicationComponentMobile,
                application_component_library_entity_1.ApplicationComponentLibrary,
                application_component_frontend_entity_1.ApplicationComponentFrontend,
            ]),
        ],
    })
], ApplicationComponentsModule);
;
//# sourceMappingURL=application-components.module.js.map