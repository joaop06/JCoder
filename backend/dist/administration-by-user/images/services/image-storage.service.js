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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageStorageService = void 0;
const image_config_interface_1 = require("../types/image-config.interface");
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const uuid_1 = require("uuid");
const common_1 = require("@nestjs/common");
let ImageStorageService = class ImageStorageService {
    constructor() {
        this.uploadBasePath = path.resolve(process.cwd(), 'src', 'administration-by-user', 'images', 'storage');
        this.resourceConfigs = new Map(Object.entries(image_config_interface_1.DEFAULT_IMAGE_CONFIGS));
    }
    async uploadImage(file, resourceType, resourceId, imageType, subPath, username) {
        const config = this.getImageConfig(resourceType, imageType);
        this.validateFile(file, config);
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        await this.ensureDirectory(dirPath);
        const filename = await this.processAndSaveImage(file, dirPath, imageType, config);
        return filename;
    }
    async uploadImages(files, resourceType, resourceId, imageType, subPath, username) {
        if (!files || files.length === 0) {
            return [];
        }
        const config = this.getImageConfig(resourceType, imageType);
        files.forEach(file => this.validateFile(file, config));
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        await this.ensureDirectory(dirPath);
        const uploadPromises = files.map(file => this.processAndSaveImage(file, dirPath, imageType, config));
        return await Promise.all(uploadPromises);
    }
    async getImagePath(resourceType, resourceId, filename, subPath, username) {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        const filePath = path.join(dirPath, filename);
        try {
            await fs.access(filePath);
            return filePath;
        }
        catch {
            throw new common_1.BadRequestException(`Image not found: ${filename}`);
        }
    }
    async deleteImage(resourceType, resourceId, filename, subPath, username) {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        const filePath = path.join(dirPath, filename);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
        }
    }
    async deleteImages(resourceType, resourceId, filenames, subPath, username) {
        if (!filenames || filenames.length === 0) {
            return;
        }
        const deletePromises = filenames.map(filename => this.deleteImage(resourceType, resourceId, filename, subPath, username));
        await Promise.all(deletePromises);
        await this.cleanupEmptyDirectory(resourceType, resourceId, subPath, username);
    }
    async deleteAllResourceImages(resourceType, resourceId, username) {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, undefined, username);
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
        }
        catch (error) {
        }
    }
    async imageExists(resourceType, resourceId, filename, subPath, username) {
        try {
            await this.getImagePath(resourceType, resourceId, filename, subPath, username);
            return true;
        }
        catch {
            return false;
        }
    }
    async processAndSaveImage(file, dirPath, imageType, config) {
        const extension = this.getOutputExtension(config.outputFormat, file.mimetype);
        const filename = `${imageType}-${(0, uuid_1.v4)()}${extension}`;
        const filePath = path.join(dirPath, filename);
        try {
            let sharpInstance = (0, sharp_1.default)(file.buffer);
            sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
                fit: config.fit,
                position: config.position,
                withoutEnlargement: config.fit === 'inside',
            });
            const processedImageBuffer = await this.convertToFormat(sharpInstance, config.outputFormat || 'jpeg', file.mimetype, config.quality, config.progressive);
            await fs.writeFile(filePath, processedImageBuffer);
            return filename;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Failed to process image: ${errorMessage}`);
        }
    }
    async convertToFormat(sharpInstance, format, originalMimeType, quality, progressive) {
        if (originalMimeType === 'image/svg+xml') {
            return await sharpInstance.toBuffer();
        }
        switch (format) {
            case 'jpeg':
                return await sharpInstance
                    .jpeg({ quality, progressive })
                    .toBuffer();
            case 'png':
                return await sharpInstance
                    .png({ quality, progressive })
                    .toBuffer();
            case 'webp':
                return await sharpInstance
                    .webp({ quality })
                    .toBuffer();
            case 'original':
                return await sharpInstance.toBuffer();
            default:
                return await sharpInstance
                    .jpeg({ quality, progressive })
                    .toBuffer();
        }
    }
    getOutputExtension(format, mimeType) {
        if (mimeType === 'image/svg+xml') {
            return '.svg';
        }
        switch (format) {
            case 'jpeg':
                return '.jpg';
            case 'png':
                return '.png';
            case 'webp':
                return '.webp';
            case 'original':
                return this.getExtensionFromMimeType(mimeType);
            default:
                return '.jpg';
        }
    }
    getExtensionFromMimeType(mimeType) {
        const mimeToExt = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
        };
        return mimeToExt[mimeType] || '.jpg';
    }
    validateFile(file, config) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!config.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: ${config.allowedMimeTypes.join(', ')}`);
        }
        if (file.size > config.maxFileSize) {
            const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(2);
            throw new common_1.BadRequestException(`File too large: ${file.size} bytes. Maximum size: ${maxSizeMB}MB`);
        }
    }
    getImageConfig(resourceType, imageType) {
        const resourceConfig = this.resourceConfigs.get(resourceType);
        if (!resourceConfig) {
            throw new common_1.BadRequestException(`No configuration found for resource type: ${resourceType}`);
        }
        const imageConfig = resourceConfig[imageType];
        if (!imageConfig) {
            throw new common_1.BadRequestException(`No configuration found for image type: ${imageType} in resource: ${resourceType}`);
        }
        return imageConfig;
    }
    buildDirectoryPath(resourceType, resourceId, subPath, username) {
        const parts = [this.uploadBasePath];
        if (username) {
            parts.push(username);
        }
        parts.push(resourceType, resourceId.toString());
        if (subPath) {
            parts.push(subPath);
        }
        return path.join(...parts);
    }
    async ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    async cleanupEmptyDirectory(resourceType, resourceId, subPath, username) {
        const dirPath = this.buildDirectoryPath(resourceType, resourceId, subPath, username);
        try {
            const files = await fs.readdir(dirPath);
            if (files.length === 0) {
                await fs.rmdir(dirPath);
            }
        }
        catch (error) {
        }
    }
    registerResourceConfig(resourceType, config) {
        this.resourceConfigs.set(resourceType, config);
    }
};
exports.ImageStorageService = ImageStorageService;
exports.ImageStorageService = ImageStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ImageStorageService);
//# sourceMappingURL=image-storage.service.js.map