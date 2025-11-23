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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationComponentsRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const application_component_api_entity_1 = require("./entities/application-component-api.entity");
const application_component_mobile_entity_1 = require("./entities/application-component-mobile.entity");
const application_component_library_entity_1 = require("./entities/application-component-library.entity");
const application_component_frontend_entity_1 = require("./entities/application-component-frontend.entity");
let ApplicationComponentsRepository = class ApplicationComponentsRepository {
    constructor(apiRepository, mobileRepository, libraryRepository, frontendRepository) {
        this.apiRepository = apiRepository;
        this.mobileRepository = mobileRepository;
        this.libraryRepository = libraryRepository;
        this.frontendRepository = frontendRepository;
    }
    async createApi(object) {
        const component = this.apiRepository.create(object);
        return await this.apiRepository.save(component);
    }
    async createMobile(object) {
        const component = this.mobileRepository.create(object);
        return await this.mobileRepository.save(component);
    }
    async createLibrary(object) {
        const component = this.libraryRepository.create(object);
        return await this.libraryRepository.save(component);
    }
    async createFrontend(object) {
        const component = this.frontendRepository.create(object);
        return await this.frontendRepository.save(component);
    }
    async updateApi(applicationId, object) {
        await this.apiRepository.update({ applicationId }, object);
        return await this.apiRepository.findOneBy({ applicationId });
    }
    async updateMobile(applicationId, object) {
        await this.mobileRepository.update({ applicationId }, object);
        return await this.mobileRepository.findOneBy({ applicationId });
    }
    async updateLibrary(applicationId, object) {
        await this.libraryRepository.update({ applicationId }, object);
        return await this.libraryRepository.findOneBy({ applicationId });
    }
    async updateFrontend(applicationId, object) {
        await this.frontendRepository.update({ applicationId }, object);
        return await this.frontendRepository.findOneBy({ applicationId });
    }
    async deleteApi(applicationId) {
        await this.apiRepository.delete({ applicationId });
    }
    async deleteMobile(applicationId) {
        await this.mobileRepository.delete({ applicationId });
    }
    async deleteLibrary(applicationId) {
        await this.libraryRepository.delete({ applicationId });
    }
    async deleteFrontend(applicationId) {
        await this.frontendRepository.delete({ applicationId });
    }
    async findApi(applicationId) {
        return await this.apiRepository.findOneBy({ applicationId });
    }
    async findMobile(applicationId) {
        return await this.mobileRepository.findOneBy({ applicationId });
    }
    async findLibrary(applicationId) {
        return await this.libraryRepository.findOneBy({ applicationId });
    }
    async findFrontend(applicationId) {
        return await this.frontendRepository.findOneBy({ applicationId });
    }
};
exports.ApplicationComponentsRepository = ApplicationComponentsRepository;
exports.ApplicationComponentsRepository = ApplicationComponentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(application_component_api_entity_1.ApplicationComponentApi)),
    __param(1, (0, typeorm_2.InjectRepository)(application_component_mobile_entity_1.ApplicationComponentMobile)),
    __param(2, (0, typeorm_2.InjectRepository)(application_component_library_entity_1.ApplicationComponentLibrary)),
    __param(3, (0, typeorm_2.InjectRepository)(application_component_frontend_entity_1.ApplicationComponentFrontend)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], ApplicationComponentsRepository);
;
//# sourceMappingURL=application-componets.reposiotry.js.map