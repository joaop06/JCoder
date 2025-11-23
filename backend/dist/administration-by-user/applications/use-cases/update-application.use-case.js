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
exports.UpdateApplicationUseCase = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("../applications.service");
const already_exists_application_exception_1 = require("../exceptions/already-exists-application-exception");
const application_components_service_1 = require("../application-components/application-components.service");
let UpdateApplicationUseCase = class UpdateApplicationUseCase {
    constructor(applicationsService, applicationComponentsService) {
        this.applicationsService = applicationsService;
        this.applicationComponentsService = applicationComponentsService;
    }
    async execute(username, id, updateApplicationDto) {
        const application = await this.applicationsService.findById(id, username);
        await this.existsApplicationName(username, id, updateApplicationDto.name);
        const updatedApplication = await this.applicationsService.update(id, updateApplicationDto);
        await this.applicationComponentsService.updateComponents({
            user: application.user,
            application: updatedApplication,
            dtos: {
                applicationComponentApi: updateApplicationDto.applicationComponentApi,
                applicationComponentMobile: updateApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: updateApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: updateApplicationDto.applicationComponentFrontend,
            },
        });
        if (updateApplicationDto.technologyIds !== undefined) {
            await this.applicationsService.setApplicationTechnologies(id, updateApplicationDto.technologyIds);
        }
        return await this.applicationsService.findById(id, username);
    }
    async existsApplicationName(username, id, name) {
        if (!name)
            return;
        const exists = await this.applicationsService.existsByApplicationNameAndUsername(username, name);
        if (exists && exists.id !== id)
            throw new already_exists_application_exception_1.AlreadyExistsApplicationException();
    }
};
exports.UpdateApplicationUseCase = UpdateApplicationUseCase;
exports.UpdateApplicationUseCase = UpdateApplicationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        application_components_service_1.ApplicationComponentsService])
], UpdateApplicationUseCase);
;
//# sourceMappingURL=update-application.use-case.js.map