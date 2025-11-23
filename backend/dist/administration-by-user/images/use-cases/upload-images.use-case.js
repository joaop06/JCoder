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
exports.UploadImagesUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const images_service_1 = require("../images.service");
const typeorm_2 = require("@nestjs/typeorm");
const image_type_enum_1 = require("../enums/image-type.enum");
const resource_type_enum_1 = require("../enums/resource-type.enum");
const cache_service_1 = require("../../../@common/services/cache.service");
const image_storage_service_1 = require("../services/image-storage.service");
const application_entity_1 = require("../../applications/entities/application.entity");
let UploadImagesUseCase = class UploadImagesUseCase {
    constructor(cacheService, imagesService, imageStorageService, applicationRepository) {
        this.cacheService = cacheService;
        this.imagesService = imagesService;
        this.imageStorageService = imageStorageService;
        this.applicationRepository = applicationRepository;
    }
    async execute(id, files) {
        const application = await this.imagesService.findApplicationById(id);
        const newImageFilenames = await this.imageStorageService.uploadImages(files, resource_type_enum_1.ResourceType.Application, id, image_type_enum_1.ImageType.Gallery, undefined, application.user.username);
        const existingImages = application.images || [];
        application.images = [...existingImages, ...newImageFilenames];
        const updatedApplication = await this.applicationRepository.save(application);
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        return updatedApplication;
    }
};
exports.UploadImagesUseCase = UploadImagesUseCase;
exports.UploadImagesUseCase = UploadImagesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_2.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        images_service_1.ImagesService,
        image_storage_service_1.ImageStorageService,
        typeorm_1.Repository])
], UploadImagesUseCase);
;
//# sourceMappingURL=upload-images.use-case.js.map