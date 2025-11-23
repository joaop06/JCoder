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
exports.GetExperiencesUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const class_transformer_1 = require("class-transformer");
const get_experiences_dto_1 = require("../dto/get-experiences.dto");
const cache_service_1 = require("../../@common/services/cache.service");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const user_not_found_exception_1 = require("../../administration-by-user/users/exceptions/user-not-found.exception");
const user_component_experience_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-experience.entity");
let GetExperiencesUseCase = class GetExperiencesUseCase {
    constructor(cacheService, userRepository, experienceRepository) {
        this.cacheService = cacheService;
        this.userRepository = userRepository;
        this.experienceRepository = experienceRepository;
    }
    async execute(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'companyName', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'companyName'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'companyName';
        const cacheKey = this.cacheService.generateKey('portfolio', 'experiences', username, page, limit, validatedSortBy, sortOrder);
        const result = await this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.userRepository.findOneBy({ username });
            if (!user)
                throw new user_not_found_exception_1.UserNotFoundException();
            const [data, total] = await this.experienceRepository.findAndCount({
                where: { userId: user.id },
                relations: ['positions'],
                skip,
                take: limit,
                order: { [validatedSortBy]: sortOrder },
            });
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasPreviousPage: page > 1,
                    hasNextPage: page < totalPages,
                },
            };
        }, 300);
        return (0, class_transformer_1.plainToInstance)(get_experiences_dto_1.GetExperiencesDto, result);
    }
};
exports.GetExperiencesUseCase = GetExperiencesUseCase;
exports.GetExperiencesUseCase = GetExperiencesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(user_component_experience_entity_1.UserComponentExperience)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], GetExperiencesUseCase);
//# sourceMappingURL=get-experiences.use-case.js.map