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
exports.TechnologiesService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const technology_entity_1 = require("./entities/technology.entity");
const cache_service_1 = require("../../@common/services/cache.service");
const image_upload_service_1 = require("../images/services/image-upload.service");
const users_service_1 = require("../users/users.service");
const technology_not_found_exception_1 = require("./exceptions/technology-not-found.exception");
let TechnologiesService = class TechnologiesService {
    constructor(cacheService, usersService, repository, imageUploadService) {
        this.cacheService = cacheService;
        this.usersService = usersService;
        this.repository = repository;
        this.imageUploadService = imageUploadService;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC', isActive, } = paginationDto;
        const skip = (page - 1) * limit;
        const where = { user: { username } };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const cacheKey = this.cacheService.generateKey('technologies', 'paginated', username, page, limit, sortBy, sortOrder, isActive !== undefined ? String(isActive) : 'all');
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.repository.findAndCount({
                skip,
                take: limit,
                where,
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
                    hasPreviousPage: page > 1,
                    hasNextPage: page < totalPages,
                },
            };
        }, 300);
    }
    async findById(id, username) {
        const cacheKey = this.cacheService.technologyKey(id, 'full', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const technology = await this.repository.findOne({
                where: { id, user: { username } },
            });
            if (!technology)
                throw new technology_not_found_exception_1.TechnologyNotFoundException();
            return technology;
        }, 600);
    }
    async create(createTechnologyDto) {
        const technology = this.repository.create(createTechnologyDto);
        const savedTechnology = await this.repository.save(technology);
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));
        return savedTechnology;
    }
    async update(id, updateTechnologyDto) {
        const technology = await this.repository.findOneBy({ id });
        this.repository.merge(technology, updateTechnologyDto);
        const updatedTechnology = await this.repository.save(technology);
        await this.cacheService.del(this.cacheService.technologyKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));
        return updatedTechnology;
    }
    async delete(id) {
        const technology = await this.repository.findOneBy({ id });
        if (technology.profileImage) {
            await this.imageUploadService.deleteFile('technologies', technology.profileImage);
        }
        await this.repository.delete(id);
        await this.cacheService.del(this.cacheService.technologyKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));
    }
    async incrementDisplayOrderFrom(startPosition, userId) {
        await this.repository
            .createQueryBuilder()
            .update(technology_entity_1.Technology)
            .set({ displayOrder: () => 'displayOrder + 1' })
            .where('displayOrder >= :startPosition', { startPosition })
            .andWhere('userId = :userId', { userId })
            .execute();
    }
    async reorderOnUpdate(id, oldPosition, newPosition, username) {
        if (oldPosition === newPosition) {
            return;
        }
        const user = await this.usersService.findOneBy({ username });
        if (newPosition < oldPosition) {
            await this.repository
                .createQueryBuilder()
                .update(technology_entity_1.Technology)
                .set({ displayOrder: () => 'displayOrder + 1' })
                .where('displayOrder >= :newPosition', { newPosition })
                .andWhere('displayOrder < :oldPosition', { oldPosition })
                .andWhere('id != :id', { id })
                .andWhere('userId = :userId', { userId: user.id })
                .execute();
        }
        else {
            await this.repository
                .createQueryBuilder()
                .update(technology_entity_1.Technology)
                .set({ displayOrder: () => 'displayOrder - 1' })
                .where('displayOrder > :oldPosition', { oldPosition })
                .andWhere('displayOrder <= :newPosition', { newPosition })
                .andWhere('id != :id', { id })
                .andWhere('userId = :userId', { userId: user.id })
                .execute();
        }
    }
    async decrementDisplayOrderAfter(deletedPosition, username) {
        const user = await this.usersService.findOneBy({ username });
        await this.repository
            .createQueryBuilder()
            .update(technology_entity_1.Technology)
            .set({ displayOrder: () => 'displayOrder - 1' })
            .where('displayOrder > :deletedPosition', { deletedPosition })
            .andWhere('userId = :userId', { userId: user.id })
            .execute();
    }
    async getStats(username) {
        const cacheKey = this.cacheService.generateKey('technologies', 'stats', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [total, active, inactive] = await Promise.all([
                this.repository.count({ where: { user: { username } } }),
                this.repository.count({ where: { user: { username }, isActive: true } }),
                this.repository.count({ where: { user: { username }, isActive: false } }),
            ]);
            return { active, inactive, total };
        }, 300);
    }
    async existsByTechnologyNameAndUsername(username, name) {
        return await this.repository.findOneBy({ user: { username }, name });
    }
};
exports.TechnologiesService = TechnologiesService;
exports.TechnologiesService = TechnologiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(technology_entity_1.Technology)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        users_service_1.UsersService,
        typeorm_1.Repository,
        image_upload_service_1.ImageUploadService])
], TechnologiesService);
;
//# sourceMappingURL=technologies.service.js.map