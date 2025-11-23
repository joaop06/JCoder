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
exports.ReferenceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_service_1 = require("../../../../@common/services/cache.service");
const user_component_reference_entity_1 = require("../entities/user-component-reference.entity");
const reference_not_found_exception_1 = require("../exceptions/reference-not-found.exception");
let ReferenceRepository = class ReferenceRepository {
    constructor(cacheService, referenceRepository) {
        this.cacheService = cacheService;
        this.referenceRepository = referenceRepository;
    }
    async findOneBy(where) {
        const reference = await this.referenceRepository.findOneBy(where);
        if (!reference)
            throw new reference_not_found_exception_1.ReferenceNotFoundException();
        return reference;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'name', 'company', 'email', 'phone'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
        const cacheKey = this.cacheService.generateKey('references', 'paginated', username, page, limit, validatedSortBy, sortOrder);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.referenceRepository.findAndCount({
                skip,
                take: limit,
                where: { user: { username } },
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
    }
    async create(user, data) {
        const reference = this.referenceRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.referenceRepository.save(reference);
    }
    async update(id, data) {
        await this.referenceRepository.update({ id }, data);
        return await this.findOneBy({ id });
    }
    async delete(id) {
        await this.referenceRepository.delete({ id });
    }
};
exports.ReferenceRepository = ReferenceRepository;
exports.ReferenceRepository = ReferenceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_component_reference_entity_1.UserComponentReference)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_2.Repository])
], ReferenceRepository);
;
//# sourceMappingURL=reference.repository.js.map