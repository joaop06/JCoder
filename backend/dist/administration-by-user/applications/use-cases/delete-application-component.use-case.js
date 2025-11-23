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
exports.DeleteApplicationComponentUseCase = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("../applications.service");
const application_components_service_1 = require("../application-components/application-components.service");
let DeleteApplicationComponentUseCase = class DeleteApplicationComponentUseCase {
    constructor(applicationsService, applicationComponentsService) {
        this.applicationsService = applicationsService;
        this.applicationComponentsService = applicationComponentsService;
    }
    async execute(username, applicationId, componentType) {
        await this.applicationsService.findById(applicationId, username);
        await this.applicationComponentsService.deleteComponent(applicationId, componentType);
        return await this.applicationsService.findById(applicationId, username);
    }
};
exports.DeleteApplicationComponentUseCase = DeleteApplicationComponentUseCase;
exports.DeleteApplicationComponentUseCase = DeleteApplicationComponentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        application_components_service_1.ApplicationComponentsService])
], DeleteApplicationComponentUseCase);
;
//# sourceMappingURL=delete-application-component.use-case.js.map