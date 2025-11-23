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
exports.ExperienceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_service_1 = require("../../../../@common/services/cache.service");
const user_component_experience_entity_1 = require("../entities/user-component-experience.entity");
const user_component_experience_position_entity_1 = require("../entities/user-component-experience-position.entity");
let ExperienceRepository = class ExperienceRepository {
    constructor(cacheService, experienceRepository, experiencePositionRepository) {
        this.cacheService = cacheService;
        this.experienceRepository = experienceRepository;
        this.experiencePositionRepository = experiencePositionRepository;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'companyName', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'companyName'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'companyName';
        const cacheKey = this.cacheService.generateKey('experiences', 'paginated', username, page, limit, validatedSortBy, sortOrder);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.experienceRepository.findAndCount({
                skip,
                take: limit,
                relations: ['positions'],
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
        const experience = this.experienceRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.experienceRepository.save(experience);
    }
    async update(id, data) {
        const { positions, ...experienceData } = data;
        await this.experienceRepository.update({ id }, experienceData);
        if (positions && Array.isArray(positions)) {
            await this.savePositions(id, positions);
        }
        return await this.experienceRepository.findOne({
            where: { id },
            relations: ['positions'],
        });
    }
    async delete(id) {
        await this.experienceRepository.delete({ id });
    }
    async createPosition(experienceId, data) {
        const position = this.experiencePositionRepository.create({
            ...data,
            experienceId,
        });
        return await this.experiencePositionRepository.save(position);
    }
    async savePositions(experienceId, positions) {
        await this.deletePositions({ experienceId });
        const savedPositions = [];
        for (const position of positions) {
            const saved = await this.createPosition(experienceId, position);
            savedPositions.push(saved);
        }
        return savedPositions;
    }
    async deletePositions(where) {
        await this.experiencePositionRepository.delete(where);
    }
};
exports.ExperienceRepository = ExperienceRepository;
exports.ExperienceRepository = ExperienceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_component_experience_entity_1.UserComponentExperience)),
    __param(2, (0, typeorm_1.InjectRepository)(user_component_experience_position_entity_1.UserComponentExperiencePosition)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExperienceRepository);
;
//# sourceMappingURL=experience.repository.js.map