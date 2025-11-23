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
exports.GetImageUseCase = void 0;
const common_1 = require("@nestjs/common");
const images_service_1 = require("../images.service");
const resource_type_enum_1 = require("../enums/resource-type.enum");
const image_storage_service_1 = require("../services/image-storage.service");
const application_not_found_exception_1 = require("../../applications/exceptions/application-not-found.exception");
let GetImageUseCase = class GetImageUseCase {
    constructor(imagesService, imageStorageService) {
        this.imagesService = imagesService;
        this.imageStorageService = imageStorageService;
    }
    async execute(id, filename) {
        const application = await this.imagesService.findApplicationById(id);
        if (!application.images || !application.images.includes(filename)) {
            throw new application_not_found_exception_1.ApplicationNotFoundException();
        }
        return await this.imageStorageService.getImagePath(resource_type_enum_1.ResourceType.Application, id, filename, undefined, application.user.username);
    }
};
exports.GetImageUseCase = GetImageUseCase;
exports.GetImageUseCase = GetImageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [images_service_1.ImagesService,
        image_storage_service_1.ImageStorageService])
], GetImageUseCase);
;
//# sourceMappingURL=get-image.use-case.js.map