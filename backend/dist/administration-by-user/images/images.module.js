"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const images_service_1 = require("./images.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const user_entity_1 = require("../users/entities/user.entity");
const images_controller_1 = require("./images.controller");
const cache_service_1 = require("../../@common/services/cache.service");
const image_upload_service_1 = require("./services/image-upload.service");
const image_storage_service_1 = require("./services/image-storage.service");
const technology_entity_1 = require("../technologies/entities/technology.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const get_image_use_case_1 = require("./use-cases/get-image.use-case");
const delete_image_use_case_1 = require("./use-cases/delete-image.use-case");
const upload_images_use_case_1 = require("./use-cases/upload-images.use-case");
const get_profile_image_use_case_1 = require("./use-cases/get-profile-image.use-case");
const delete_profile_image_use_case_1 = require("./use-cases/delete-profile-image.use-case");
const update_profile_image_use_case_1 = require("./use-cases/update-profile-image.use-case");
const upload_profile_image_use_case_1 = require("./use-cases/upload-profile-image.use-case");
const get_technology_profile_image_use_case_1 = require("./use-cases/get-technology-profile-image.use-case");
const delete_technology_profile_image_use_case_1 = require("./use-cases/delete-technology-profile-image.use-case");
const upload_technology_profile_image_use_case_1 = require("./use-cases/upload-technology-profile-image.use-case");
const get_user_profile_image_use_case_1 = require("./use-cases/get-user-profile-image.use-case");
const delete_user_profile_image_use_case_1 = require("./use-cases/delete-user-profile-image.use-case");
const upload_user_profile_image_use_case_1 = require("./use-cases/upload-user-profile-image.use-case");
const get_certificate_image_use_case_1 = require("./use-cases/get-certificate-image.use-case");
const delete_certificate_image_use_case_1 = require("./use-cases/delete-certificate-image.use-case");
const upload_certificate_image_use_case_1 = require("./use-cases/upload-certificate-image.use-case");
const user_component_certificate_entity_1 = require("../users/user-components/entities/user-component-certificate.entity");
let ImagesModule = class ImagesModule {
};
exports.ImagesModule = ImagesModule;
exports.ImagesModule = ImagesModule = __decorate([
    (0, common_1.Module)({
        providers: [
            cache_service_1.CacheService,
            images_service_1.ImagesService,
            image_upload_service_1.ImageUploadService,
            image_storage_service_1.ImageStorageService,
            get_image_use_case_1.GetImageUseCase,
            delete_image_use_case_1.DeleteImageUseCase,
            upload_images_use_case_1.UploadImagesUseCase,
            get_profile_image_use_case_1.GetProfileImageUseCase,
            delete_profile_image_use_case_1.DeleteProfileImageUseCase,
            update_profile_image_use_case_1.UpdateProfileImageUseCase,
            upload_profile_image_use_case_1.UploadProfileImageUseCase,
            get_technology_profile_image_use_case_1.GetTechnologyProfileImageUseCase,
            delete_technology_profile_image_use_case_1.DeleteTechnologyProfileImageUseCase,
            upload_technology_profile_image_use_case_1.UploadTechnologyProfileImageUseCase,
            get_user_profile_image_use_case_1.GetUserProfileImageUseCase,
            delete_user_profile_image_use_case_1.DeleteUserProfileImageUseCase,
            upload_user_profile_image_use_case_1.UploadUserProfileImageUseCase,
            get_certificate_image_use_case_1.GetCertificateImageUseCase,
            delete_certificate_image_use_case_1.DeleteCertificateImageUseCase,
            upload_certificate_image_use_case_1.UploadCertificateImageUseCase,
        ],
        controllers: [images_controller_1.ImagesController],
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                technology_entity_1.Technology,
                application_entity_1.Application,
                user_component_certificate_entity_1.UserComponentCertificate,
            ]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
            }),
        ],
        exports: [
            images_service_1.ImagesService,
            image_upload_service_1.ImageUploadService,
            image_storage_service_1.ImageStorageService,
            get_user_profile_image_use_case_1.GetUserProfileImageUseCase,
            get_certificate_image_use_case_1.GetCertificateImageUseCase,
            delete_certificate_image_use_case_1.DeleteCertificateImageUseCase,
            delete_user_profile_image_use_case_1.DeleteUserProfileImageUseCase,
            upload_certificate_image_use_case_1.UploadCertificateImageUseCase,
            upload_user_profile_image_use_case_1.UploadUserProfileImageUseCase,
        ],
    })
], ImagesModule);
//# sourceMappingURL=images.module.js.map