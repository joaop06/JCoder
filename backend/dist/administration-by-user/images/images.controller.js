"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const user_entity_1 = require("../users/entities/user.entity");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../@common/guards/jwt-auth.guard");
const technology_entity_1 = require("../technologies/entities/technology.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const user_not_found_exception_1 = require("../users/exceptions/user-not-found.exception");
const swagger_1 = require("@nestjs/swagger");
const technology_not_found_exception_1 = require("../technologies/exceptions/technology-not-found.exception");
const application_not_found_exception_1 = require("../applications/exceptions/application-not-found.exception");
const api_exception_response_decorator_1 = require("../../@common/decorators/documentation/api-exception-response.decorator");
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
let ImagesController = class ImagesController {
    constructor(getImageUseCase, deleteImageUseCase, uploadImagesUseCase, getProfileImageUseCase, deleteProfileImageUseCase, updateProfileImageUseCase, uploadProfileImageUseCase, getCertificateImageUseCase, getUserProfileImageUseCase, deleteCertificateImageUseCase, deleteUserProfileImageUseCase, uploadCertificateImageUseCase, uploadUserProfileImageUseCase, getTechnologyProfileImageUseCase, uploadTechnologyProfileImageUseCase, deleteTechnologyProfileImageUseCase) {
        this.getImageUseCase = getImageUseCase;
        this.deleteImageUseCase = deleteImageUseCase;
        this.uploadImagesUseCase = uploadImagesUseCase;
        this.getProfileImageUseCase = getProfileImageUseCase;
        this.deleteProfileImageUseCase = deleteProfileImageUseCase;
        this.updateProfileImageUseCase = updateProfileImageUseCase;
        this.uploadProfileImageUseCase = uploadProfileImageUseCase;
        this.getCertificateImageUseCase = getCertificateImageUseCase;
        this.getUserProfileImageUseCase = getUserProfileImageUseCase;
        this.deleteCertificateImageUseCase = deleteCertificateImageUseCase;
        this.deleteUserProfileImageUseCase = deleteUserProfileImageUseCase;
        this.uploadCertificateImageUseCase = uploadCertificateImageUseCase;
        this.uploadUserProfileImageUseCase = uploadUserProfileImageUseCase;
        this.getTechnologyProfileImageUseCase = getTechnologyProfileImageUseCase;
        this.uploadTechnologyProfileImageUseCase = uploadTechnologyProfileImageUseCase;
        this.deleteTechnologyProfileImageUseCase = deleteTechnologyProfileImageUseCase;
    }
    async uploadApplicationProfileImage(id, files) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadProfileImageUseCase.execute(id, files[0]);
    }
    async updateApplicationProfileImage(id, files) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.updateProfileImageUseCase.execute(id, files[0]);
    }
    async getApplicationProfileImage(res, id) {
        const imagePath = await this.getProfileImageUseCase.execute(id);
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    async deleteApplicationProfileImage(id) {
        await this.deleteProfileImageUseCase.execute(id);
    }
    async uploadApplicationImages(id, files) {
        return await this.uploadImagesUseCase.execute(id, files);
    }
    async getApplicationImage(id, filename, res) {
        const imagePath = await this.getImageUseCase.execute(id, filename);
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    async deleteApplicationImage(id, filename) {
        await this.deleteImageUseCase.execute(id, filename);
    }
    async uploadTechnologyProfileImage(id, files) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadTechnologyProfileImageUseCase.execute(id, files[0]);
    }
    async getTechnologyProfileImage(id, res) {
        const imagePath = await this.getTechnologyProfileImageUseCase.execute(id);
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000',
        });
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    async deleteTechnologyProfileImage(id) {
        await this.deleteTechnologyProfileImageUseCase.execute(id);
    }
    async uploadUserProfileImage(id, files) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadUserProfileImageUseCase.execute(id, files[0]);
    }
    async getUserProfileImage(res, id) {
        const imagePath = await this.getUserProfileImageUseCase.execute(id);
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    async deleteUserProfileImage(id) {
        await this.deleteUserProfileImageUseCase.execute(id);
    }
    async uploadCertificateImage(username, certificateId, files) {
        if (!files || files.length === 0) {
            throw new Error('No file uploaded');
        }
        return await this.uploadCertificateImageUseCase.execute(username, certificateId, files[0]);
    }
    async getCertificateImage(res, username, certificateId) {
        const imagePath = await this.getCertificateImageUseCase.execute(username, certificateId);
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        });
        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    async deleteCertificateImage(username, certificateId) {
        await this.deleteCertificateImageUseCase.execute(username, certificateId);
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Post)('applications/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG, WebP and SVG images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "uploadApplicationProfileImage", null);
__decorate([
    (0, common_1.Put)('applications/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "updateApplicationProfileImage", null);
__decorate([
    (0, common_1.Get)('applications/:id/profile-image'),
    (0, swagger_1.ApiOkResponse)({ description: 'Profile image file' }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getApplicationProfileImage", null);
__decorate([
    (0, common_1.Delete)('applications/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteApplicationProfileImage", null);
__decorate([
    (0, common_1.Post)('applications/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ type: () => application_entity_1.Application }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "uploadApplicationImages", null);
__decorate([
    (0, common_1.Get)('applications/:id/:filename'),
    (0, swagger_1.ApiOkResponse)({ description: 'Image file' }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getApplicationImage", null);
__decorate([
    (0, common_1.Delete)('applications/:id/:filename'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => application_not_found_exception_1.ApplicationNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteApplicationImage", null);
__decorate([
    (0, common_1.Post)('technologies/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG, WebP and SVG images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ type: () => technology_entity_1.Technology }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => technology_not_found_exception_1.TechnologyNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "uploadTechnologyProfileImage", null);
__decorate([
    (0, common_1.Get)('technologies/:id/profile-image'),
    (0, swagger_1.ApiOkResponse)({ description: 'Technology profile image file' }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => technology_not_found_exception_1.TechnologyNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getTechnologyProfileImage", null);
__decorate([
    (0, common_1.Delete)('technologies/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => technology_not_found_exception_1.TechnologyNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteTechnologyProfileImage", null);
__decorate([
    (0, common_1.Post)('users/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('profileImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ type: () => user_entity_1.User }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "uploadUserProfileImage", null);
__decorate([
    (0, common_1.Get)('users/:id/profile-image'),
    (0, swagger_1.ApiOkResponse)({ description: 'User profile image file' }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getUserProfileImage", null);
__decorate([
    (0, common_1.Delete)('users/:id/profile-image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteUserProfileImage", null);
__decorate([
    (0, common_1.Post)('users/certificates/:certificateId/image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('certificateImage', 1, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
            }
        },
    })),
    (0, swagger_1.ApiOkResponse)({ description: 'Certificate with uploaded image' }),
    (0, api_exception_response_decorator_1.ApiExceptionResponse)(() => user_not_found_exception_1.UserNotFoundException),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('certificateId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Array]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "uploadCertificateImage", null);
__decorate([
    (0, common_1.Get)('users/certificates/:certificateId/image'),
    (0, swagger_1.ApiOkResponse)({ description: 'Certificate image file' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('certificateId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getCertificateImage", null);
__decorate([
    (0, common_1.Delete)('users/certificates/:certificateId/image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiNoContentResponse)(),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('certificateId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteCertificateImage", null);
exports.ImagesController = ImagesController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':username/images'),
    (0, swagger_1.ApiTags)('Administration Images'),
    __metadata("design:paramtypes", [get_image_use_case_1.GetImageUseCase,
        delete_image_use_case_1.DeleteImageUseCase,
        upload_images_use_case_1.UploadImagesUseCase,
        get_profile_image_use_case_1.GetProfileImageUseCase,
        delete_profile_image_use_case_1.DeleteProfileImageUseCase,
        update_profile_image_use_case_1.UpdateProfileImageUseCase,
        upload_profile_image_use_case_1.UploadProfileImageUseCase,
        get_certificate_image_use_case_1.GetCertificateImageUseCase,
        get_user_profile_image_use_case_1.GetUserProfileImageUseCase,
        delete_certificate_image_use_case_1.DeleteCertificateImageUseCase,
        delete_user_profile_image_use_case_1.DeleteUserProfileImageUseCase,
        upload_certificate_image_use_case_1.UploadCertificateImageUseCase,
        upload_user_profile_image_use_case_1.UploadUserProfileImageUseCase,
        get_technology_profile_image_use_case_1.GetTechnologyProfileImageUseCase,
        upload_technology_profile_image_use_case_1.UploadTechnologyProfileImageUseCase,
        delete_technology_profile_image_use_case_1.DeleteTechnologyProfileImageUseCase])
], ImagesController);
;
//# sourceMappingURL=images.controller.js.map