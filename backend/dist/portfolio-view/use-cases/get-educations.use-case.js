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
exports.GetEducationsUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const class_transformer_1 = require("class-transformer");
const get_educations_dto_1 = require("../dto/get-educations.dto");
const cache_service_1 = require("../../@common/services/cache.service");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const user_not_found_exception_1 = require("../../administration-by-user/users/exceptions/user-not-found.exception");
const user_component_education_entity_1 = require("../../administration-by-user/users/user-components/entities/user-component-education.entity");
let GetEducationsUseCase = class GetEducationsUseCase {
    constructor(cacheService, userRepository, educationRepository) {
        this.cacheService = cacheService;
        this.userRepository = userRepository;
        this.educationRepository = educationRepository;
    }
    async execute(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'startDate';
        const cacheKey = this.cacheService.generateKey('portfolio', 'educations', username, page, limit, validatedSortBy, sortOrder);
        const result = await this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.userRepository.findOneBy({ username });
            if (!user)
                throw new user_not_found_exception_1.UserNotFoundException();
            const [data, total] = await this.educationRepository.findAndCount({
                where: { userId: user.id },
                relations: ['certificates'],
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
        return (0, class_transformer_1.plainToInstance)(get_educations_dto_1.GetEducationsDto, result);
    }
};
exports.GetEducationsUseCase = GetEducationsUseCase;
exports.GetEducationsUseCase = GetEducationsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(user_component_education_entity_1.UserComponentEducation)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], GetEducationsUseCase);
;
//# sourceMappingURL=get-educations.use-case.js.map