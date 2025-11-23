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
exports.UploadCertificateImageUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const image_type_enum_1 = require("../enums/image-type.enum");
const resource_type_enum_1 = require("../enums/resource-type.enum");
const image_storage_service_1 = require("../services/image-storage.service");
const user_component_certificate_entity_1 = require("../../users/user-components/entities/user-component-certificate.entity");
const component_not_found_exceptions_1 = require("../../users/user-components/exceptions/component-not-found.exceptions");
let UploadCertificateImageUseCase = class UploadCertificateImageUseCase {
    constructor(imageStorageService, certificateRepository) {
        this.imageStorageService = imageStorageService;
        this.certificateRepository = certificateRepository;
    }
    async execute(username, certificateId, file) {
        const certificate = await this.certificateRepository.findOne({
            relations: ['user'],
            where: { id: certificateId },
        });
        if (!certificate) {
            throw new component_not_found_exceptions_1.ComponentNotFoundException('Certificate not found');
        }
        if (certificate.user.username !== username) {
            throw new component_not_found_exceptions_1.ComponentNotFoundException('Certificate not found');
        }
        if (certificate.profileImage) {
            await this.imageStorageService.deleteImage(resource_type_enum_1.ResourceType.User, certificateId, certificate.profileImage, 'certificates', certificate.user.username);
        }
        const filename = await this.imageStorageService.uploadImage(file, resource_type_enum_1.ResourceType.User, certificateId, image_type_enum_1.ImageType.Component, 'certificates', certificate.user.username);
        certificate.profileImage = filename;
        return await this.certificateRepository.save(certificate);
    }
};
exports.UploadCertificateImageUseCase = UploadCertificateImageUseCase;
exports.UploadCertificateImageUseCase = UploadCertificateImageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_component_certificate_entity_1.UserComponentCertificate)),
    __metadata("design:paramtypes", [image_storage_service_1.ImageStorageService,
        typeorm_1.Repository])
], UploadCertificateImageUseCase);
;
//# sourceMappingURL=upload-certificate-image.use-case.js.map