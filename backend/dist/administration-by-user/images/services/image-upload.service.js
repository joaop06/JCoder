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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const fs = __importStar(require("fs/promises"));
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
let ImageUploadService = ImageUploadService_1 = class ImageUploadService {
    constructor(configService) {
        this.configService = configService;
        this.uploadPath = ImageUploadService_1.APPLICATIONS_PATH;
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024);
        this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }
    async uploadImages(files, applicationId) {
        if (!files || files.length === 0) {
            return [];
        }
        this.validateFiles(files);
        await this.ensureUploadDirectory(applicationId);
        const uploadedFilenames = [];
        for (const file of files) {
            const filename = await this.processAndSaveImage(file, applicationId);
            uploadedFilenames.push(filename);
        }
        return uploadedFilenames;
    }
    validateFiles(files) {
        for (const file of files) {
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
            }
            if (file.size > this.maxFileSize) {
                throw new common_1.BadRequestException(`File too large: ${file.size} bytes. Maximum size: ${this.maxFileSize} bytes`);
            }
        }
    }
    async processAndSaveImage(file, applicationId) {
        const filename = `${(0, uuid_1.v4)()}.jpg`;
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);
        try {
            const processedImageBuffer = await (0, sharp_1.default)(file.buffer)
                .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({
                quality: 85,
                progressive: true
            })
                .toBuffer();
            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to process image: ${errorMessage}`);
        }
    }
    async ensureUploadDirectory(applicationId) {
        const applicationDir = path.join(this.uploadPath, applicationId.toString());
        try {
            await fs.access(applicationDir);
        }
        catch {
            await fs.mkdir(applicationDir, { recursive: true });
        }
    }
    async getImagePath(applicationId, filename) {
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);
        try {
            await fs.access(filePath);
            return filePath;
        }
        catch {
            throw new common_1.BadRequestException(`Image not found: ${filename}`);
        }
    }
    async deleteApplicationImages(applicationId, filenames) {
        if (!filenames || filenames.length === 0) {
            return;
        }
        const applicationDir = path.join(this.uploadPath, applicationId.toString());
        for (const filename of filenames) {
            const filePath = path.join(applicationDir, filename);
            try {
                await fs.unlink(filePath);
            }
            catch (error) {
            }
        }
        try {
            const files = await fs.readdir(applicationDir);
            if (files.length === 0) {
                await fs.rmdir(applicationDir);
            }
        }
        catch (error) {
        }
    }
    async deleteAllApplicationImages(applicationId) {
        const applicationDir = path.join(this.uploadPath, applicationId.toString());
        try {
            await fs.rm(applicationDir, { recursive: true, force: true });
        }
        catch (error) {
        }
    }
    async uploadProfileImage(file, applicationId) {
        this.validateFiles([file]);
        await this.ensureUploadDirectory(applicationId);
        const filename = `profile-${(0, uuid_1.v4)()}.jpg`;
        const filePath = path.join(this.uploadPath, applicationId.toString(), filename);
        try {
            const processedImageBuffer = await (0, sharp_1.default)(file.buffer)
                .resize(400, 400, {
                fit: 'cover',
                position: 'center'
            })
                .jpeg({
                quality: 90,
                progressive: true
            })
                .toBuffer();
            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to process profile image: ${errorMessage}`);
        }
    }
    async getProfileImagePath(applicationId, filename) {
        return await this.getImagePath(applicationId, filename);
    }
    async uploadFile(file, entityFolder, prefix = 'file') {
        this.validateFiles([file]);
        const uploadPath = path.join(ImageUploadService_1.STORAGE_BASE_PATH, entityFolder);
        try {
            await fs.access(uploadPath);
        }
        catch {
            await fs.mkdir(uploadPath, { recursive: true });
        }
        const filename = `${prefix}-${(0, uuid_1.v4)()}.jpg`;
        const filePath = path.join(uploadPath, filename);
        try {
            const processedImageBuffer = await (0, sharp_1.default)(file.buffer)
                .resize(400, 400, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({
                quality: 90,
                progressive: true
            })
                .toBuffer();
            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to process file: ${errorMessage}`);
        }
    }
    async deleteFile(entityFolder, filename) {
        const filePath = path.join(ImageUploadService_1.STORAGE_BASE_PATH, entityFolder, filename);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
        }
    }
    async getFilePath(entityFolder, filename) {
        const filePath = path.join(ImageUploadService_1.STORAGE_BASE_PATH, entityFolder, filename);
        try {
            await fs.access(filePath);
            return filePath;
        }
        catch {
            throw new common_1.BadRequestException(`File not found: ${filename}`);
        }
    }
};
exports.ImageUploadService = ImageUploadService;
ImageUploadService.STORAGE_BASE_PATH = path.resolve(__dirname, '../../storage');
ImageUploadService.APPLICATIONS_PATH = path.join(ImageUploadService_1.STORAGE_BASE_PATH, 'applications');
exports.ImageUploadService = ImageUploadService = ImageUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageUploadService);
//# sourceMappingURL=image-upload.service.js.map