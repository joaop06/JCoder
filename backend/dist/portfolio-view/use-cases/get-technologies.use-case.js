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
exports.GetTechnologiesUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const class_transformer_1 = require("class-transformer");
const get_technologies_dto_1 = require("../dto/get-technologies.dto");
const cache_service_1 = require("../../@common/services/cache.service");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const technology_entity_1 = require("../../administration-by-user/technologies/entities/technology.entity");
const user_not_found_exception_1 = require("../../administration-by-user/users/exceptions/user-not-found.exception");
let GetTechnologiesUseCase = class GetTechnologiesUseCase {
    constructor(cacheService, userRepository, technologyRepository) {
        this.cacheService = cacheService;
        this.userRepository = userRepository;
        this.technologyRepository = technologyRepository;
    }
    async execute(username, paginationDto) {
        const { page = 1, limit = 50, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey('portfolio', 'technologies', username, page, limit, sortBy, sortOrder);
        const user = await this.userRepository.findOneBy({ username });
        if (!user)
            throw new user_not_found_exception_1.UserNotFoundException();
        const result = await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.technologyRepository.findAndCount({
                where: { userId: user.id, isActive: true },
                skip,
                take: limit,
                order: { [sortBy]: sortOrder },
            });
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
        }, 300);
        return (0, class_transformer_1.plainToInstance)(get_technologies_dto_1.GetTechnologiesDto, result);
    }
};
exports.GetTechnologiesUseCase = GetTechnologiesUseCase;
exports.GetTechnologiesUseCase = GetTechnologiesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(technology_entity_1.Technology)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], GetTechnologiesUseCase);
//# sourceMappingURL=get-technologies.use-case.js.map