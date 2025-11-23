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
exports.ImagesService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const cache_service_1 = require("../../@common/services/cache.service");
const application_entity_1 = require("../applications/entities/application.entity");
const application_not_found_exception_1 = require("../applications/exceptions/application-not-found.exception");
let ImagesService = class ImagesService {
    constructor(cacheService, applicationRepository) {
        this.cacheService = cacheService;
        this.applicationRepository = applicationRepository;
    }
    async findApplicationById(id) {
        const cacheKey = this.cacheService.applicationKey(id, 'full');
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const application = await this.applicationRepository.findOne({
                where: { id },
                relations: {
                    user: true,
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
            if (!application)
                throw new application_not_found_exception_1.ApplicationNotFoundException();
            return application;
        }, 600);
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_1.Repository])
], ImagesService);
;
//# sourceMappingURL=images.service.js.map