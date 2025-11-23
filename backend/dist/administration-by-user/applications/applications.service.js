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
exports.ApplicationsService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const users_service_1 = require("../users/users.service");
const application_entity_1 = require("./entities/application.entity");
const cache_service_1 = require("../../@common/services/cache.service");
const technology_entity_1 = require("../technologies/entities/technology.entity");
const image_upload_service_1 = require("../images/services/image-upload.service");
const application_not_found_exception_1 = require("./exceptions/application-not-found.exception");
let ApplicationsService = class ApplicationsService {
    constructor(cacheService, usersService, repository, imageUploadService, technologyRepository) {
        this.cacheService = cacheService;
        this.usersService = usersService;
        this.repository = repository;
        this.imageUploadService = imageUploadService;
        this.technologyRepository = technologyRepository;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const cacheKey = this.cacheService.generateKey('applications', 'paginated', username, page, limit, sortBy, sortOrder);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.repository.findAndCount({
                skip,
                take: limit,
                where: { user: { username } },
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
        const cacheKey = this.cacheService.applicationKey(id, 'full', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const application = await this.repository.findOne({
                where: { id, user: { username } },
                relations: {
                    user: true,
                    technologies: true,
                    applicationComponentApi: true,
                    applicationComponentMobile: true,
                    applicationComponentLibrary: true,
                    applicationComponentFrontend: true,
                },
            });
            if (!application)
                throw new application_not_found_exception_1.ApplicationNotFoundException();
            return application;
        }, 600);
    }
    async create(createApplicationDto) {
        const application = this.repository.create(createApplicationDto);
        const savedApplication = await this.repository.save(application);
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'stats'));
        return savedApplication;
    }
    async update(id, updateApplicationDto) {
        const application = await this.repository.findOneBy({ id });
        this.repository.merge(application, updateApplicationDto);
        const updatedApplication = await this.repository.save(application);
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'stats'));
        return updatedApplication;
    }
    async delete(id) {
        const application = await this.repository.findOneBy({ id });
        if (application.images && application.images.length > 0) {
            await this.imageUploadService.deleteAllApplicationImages(id);
        }
        await this.repository.delete(id);
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('applications', 'stats'));
    }
    async incrementDisplayOrderFrom(startPosition, userId) {
        await this.repository
            .createQueryBuilder()
            .update(application_entity_1.Application)
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
                .update(application_entity_1.Application)
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
                .update(application_entity_1.Application)
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
            .update(application_entity_1.Application)
            .set({ displayOrder: () => 'displayOrder - 1' })
            .where('displayOrder > :deletedPosition', { deletedPosition })
            .andWhere('userId = :userId', { userId: user.id })
            .execute();
    }
    async setApplicationTechnologies(applicationId, technologyIds) {
        if (!technologyIds || technologyIds.length === 0) {
            await this.repository
                .createQueryBuilder()
                .relation(application_entity_1.Application, 'technologies')
                .of(applicationId)
                .addAndRemove([], await this.getApplicationTechnologyIds(applicationId));
            return;
        }
        const technologies = await this.technologyRepository.find({
            where: { id: (0, typeorm_1.In)(technologyIds) },
        });
        if (technologies.length !== technologyIds.length) {
            const foundIds = technologies.map((t) => t.id);
            const missingIds = technologyIds.filter((id) => !foundIds.includes(id));
            throw new Error(`Technologies not found: ${missingIds.join(', ')}`);
        }
        const currentTechnologyIds = await this.getApplicationTechnologyIds(applicationId);
        await this.repository
            .createQueryBuilder()
            .relation(application_entity_1.Application, 'technologies')
            .of(applicationId)
            .addAndRemove(technologyIds, currentTechnologyIds);
    }
    async getApplicationTechnologyIds(applicationId) {
        const application = await this.repository.findOne({
            where: { id: applicationId },
            relations: ['technologies'],
        });
        return application?.technologies?.map((t) => t.id) || [];
    }
    async getStats(username) {
        const cacheKey = this.cacheService.generateKey('applications', 'stats', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [total, active, inactive] = await Promise.all([
                this.repository.count({ where: { user: { username } } }),
                this.repository.count({ where: { user: { username }, isActive: true } }),
                this.repository.count({ where: { user: { username }, isActive: false } }),
            ]);
            return { active, inactive, total };
        }, 300);
    }
    async existsByApplicationNameAndUsername(username, name) {
        return await this.repository.findOneBy({ name, user: { username } });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(application_entity_1.Application)),
    __param(4, (0, typeorm_2.InjectRepository)(technology_entity_1.Technology)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        users_service_1.UsersService,
        typeorm_1.Repository,
        image_upload_service_1.ImageUploadService,
        typeorm_1.Repository])
], ApplicationsService);
;
//# sourceMappingURL=applications.service.js.map