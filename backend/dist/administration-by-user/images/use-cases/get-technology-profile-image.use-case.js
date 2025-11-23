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
exports.GetTechnologyProfileImageUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const resource_type_enum_1 = require("../enums/resource-type.enum");
const image_storage_service_1 = require("../services/image-storage.service");
const technology_entity_1 = require("../../technologies/entities/technology.entity");
const technology_not_found_exception_1 = require("../../technologies/exceptions/technology-not-found.exception");
let GetTechnologyProfileImageUseCase = class GetTechnologyProfileImageUseCase {
    constructor(imageStorageService, technologyRepository) {
        this.imageStorageService = imageStorageService;
        this.technologyRepository = technologyRepository;
    }
    async execute(id) {
        const technology = await this.technologyRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!technology) {
            throw new technology_not_found_exception_1.TechnologyNotFoundException();
        }
        if (!technology.profileImage) {
            throw new Error('Technology has no profile image');
        }
        return await this.imageStorageService.getImagePath(resource_type_enum_1.ResourceType.Technology, id, technology.profileImage, undefined, technology.user.username);
    }
};
exports.GetTechnologyProfileImageUseCase = GetTechnologyProfileImageUseCase;
exports.GetTechnologyProfileImageUseCase = GetTechnologyProfileImageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(technology_entity_1.Technology)),
    __metadata("design:paramtypes", [image_storage_service_1.ImageStorageService,
        typeorm_1.Repository])
], GetTechnologyProfileImageUseCase);
;
//# sourceMappingURL=get-technology-profile-image.use-case.js.map