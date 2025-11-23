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
exports.ApplicationComponentsService = void 0;
const common_1 = require("@nestjs/common");
const application_componets_reposiotry_1 = require("./application-componets.reposiotry");
let ApplicationComponentsService = class ApplicationComponentsService {
    constructor(applicationComponentsRepository) {
        this.applicationComponentsRepository = applicationComponentsRepository;
    }
    async saveComponents({ user, application, dtos }) {
        const applicationId = application.id;
        if (dtos.applicationComponentApi) {
            await this.applicationComponentsRepository.createApi({
                ...dtos.applicationComponentApi,
                application,
                userId: user.id,
            });
        }
        if (dtos.applicationComponentMobile) {
            await this.applicationComponentsRepository.createMobile({
                ...dtos.applicationComponentMobile,
                application,
                userId: user.id,
            });
        }
        if (dtos.applicationComponentLibrary) {
            await this.applicationComponentsRepository.createLibrary({
                ...dtos.applicationComponentLibrary,
                application,
                userId: user.id,
            });
        }
        if (dtos.applicationComponentFrontend) {
            await this.applicationComponentsRepository.createFrontend({
                ...dtos.applicationComponentFrontend,
                application,
                userId: user.id,
            });
        }
    }
    async updateComponents({ user, application, dtos }) {
        const applicationId = application.id;
        if (dtos.applicationComponentApi !== undefined) {
            if (dtos.applicationComponentApi === null) {
                const existingApi = await this.applicationComponentsRepository.findApi(applicationId);
                if (existingApi) {
                    await this.applicationComponentsRepository.deleteApi(applicationId);
                }
            }
            else {
                const existingApi = await this.applicationComponentsRepository.findApi(applicationId);
                if (existingApi) {
                    await this.applicationComponentsRepository.updateApi(applicationId, {
                        ...dtos.applicationComponentApi,
                        userId: user.id,
                    });
                }
                else {
                    await this.applicationComponentsRepository.createApi({
                        ...dtos.applicationComponentApi,
                        application,
                        userId: user.id,
                    });
                }
            }
        }
        if (dtos.applicationComponentMobile !== undefined) {
            if (dtos.applicationComponentMobile === null) {
                const existingMobile = await this.applicationComponentsRepository.findMobile(applicationId);
                if (existingMobile) {
                    await this.applicationComponentsRepository.deleteMobile(applicationId);
                }
            }
            else {
                const existingMobile = await this.applicationComponentsRepository.findMobile(applicationId);
                if (existingMobile) {
                    await this.applicationComponentsRepository.updateMobile(applicationId, {
                        ...dtos.applicationComponentMobile,
                        userId: user.id,
                    });
                }
                else {
                    await this.applicationComponentsRepository.createMobile({
                        ...dtos.applicationComponentMobile,
                        application,
                        userId: user.id,
                    });
                }
            }
        }
        if (dtos.applicationComponentLibrary !== undefined) {
            if (dtos.applicationComponentLibrary === null) {
                const existingLibrary = await this.applicationComponentsRepository.findLibrary(applicationId);
                if (existingLibrary) {
                    await this.applicationComponentsRepository.deleteLibrary(applicationId);
                }
            }
            else {
                const existingLibrary = await this.applicationComponentsRepository.findLibrary(applicationId);
                if (existingLibrary) {
                    await this.applicationComponentsRepository.updateLibrary(applicationId, {
                        ...dtos.applicationComponentLibrary,
                        userId: user.id,
                    });
                }
                else {
                    await this.applicationComponentsRepository.createLibrary({
                        ...dtos.applicationComponentLibrary,
                        application,
                        userId: user.id,
                    });
                }
            }
        }
        if (dtos.applicationComponentFrontend !== undefined) {
            if (dtos.applicationComponentFrontend === null) {
                const existingFrontend = await this.applicationComponentsRepository.findFrontend(applicationId);
                if (existingFrontend) {
                    await this.applicationComponentsRepository.deleteFrontend(applicationId);
                }
            }
            else {
                const existingFrontend = await this.applicationComponentsRepository.findFrontend(applicationId);
                if (existingFrontend) {
                    await this.applicationComponentsRepository.updateFrontend(applicationId, {
                        ...dtos.applicationComponentFrontend,
                        userId: user.id,
                    });
                }
                else {
                    await this.applicationComponentsRepository.createFrontend({
                        ...dtos.applicationComponentFrontend,
                        application,
                        userId: user.id,
                    });
                }
            }
        }
    }
    async deleteComponent(applicationId, componentType) {
        switch (componentType) {
            case 'api':
                await this.applicationComponentsRepository.deleteApi(applicationId);
                break;
            case 'mobile':
                await this.applicationComponentsRepository.deleteMobile(applicationId);
                break;
            case 'library':
                await this.applicationComponentsRepository.deleteLibrary(applicationId);
                break;
            case 'frontend':
                await this.applicationComponentsRepository.deleteFrontend(applicationId);
                break;
        }
    }
};
exports.ApplicationComponentsService = ApplicationComponentsService;
exports.ApplicationComponentsService = ApplicationComponentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [application_componets_reposiotry_1.ApplicationComponentsRepository])
], ApplicationComponentsService);
;
//# sourceMappingURL=application-components.service.js.map