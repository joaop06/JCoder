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
exports.CreateApplicationUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
const applications_service_1 = require("../applications.service");
const already_exists_application_exception_1 = require("../exceptions/already-exists-application-exception");
const application_components_service_1 = require("../application-components/application-components.service");
let CreateApplicationUseCase = class CreateApplicationUseCase {
    constructor(usersService, applicationsService, applicationComponentsService) {
        this.usersService = usersService;
        this.applicationsService = applicationsService;
        this.applicationComponentsService = applicationComponentsService;
    }
    async execute(username, createApplicationDto) {
        const exists = await this.applicationsService.existsByApplicationNameAndUsername(username, createApplicationDto.name);
        if (exists)
            throw new already_exists_application_exception_1.AlreadyExistsApplicationException();
        const user = await this.usersService.findOneBy({ username });
        await this.applicationsService.incrementDisplayOrderFrom(1, user.id);
        const application = await this.applicationsService.create({
            ...createApplicationDto,
            userId: user.id,
            displayOrder: 1,
        });
        await this.applicationComponentsService.saveComponents({
            user,
            application,
            dtos: {
                applicationComponentApi: createApplicationDto.applicationComponentApi,
                applicationComponentMobile: createApplicationDto.applicationComponentMobile,
                applicationComponentLibrary: createApplicationDto.applicationComponentLibrary,
                applicationComponentFrontend: createApplicationDto.applicationComponentFrontend,
            },
        });
        if (createApplicationDto.technologyIds) {
            await this.applicationsService.setApplicationTechnologies(application.id, createApplicationDto.technologyIds);
        }
        return await this.applicationsService.findById(application.id, username);
    }
};
exports.CreateApplicationUseCase = CreateApplicationUseCase;
exports.CreateApplicationUseCase = CreateApplicationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        applications_service_1.ApplicationsService,
        application_components_service_1.ApplicationComponentsService])
], CreateApplicationUseCase);
;
//# sourceMappingURL=create-application.use-case.js.map