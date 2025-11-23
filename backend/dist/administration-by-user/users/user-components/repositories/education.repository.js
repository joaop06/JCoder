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
exports.EducationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_service_1 = require("../../../../@common/services/cache.service");
const user_component_education_entity_1 = require("../entities/user-component-education.entity");
const education_not_found_exception_1 = require("../exceptions/education-not-found.exception");
let EducationRepository = class EducationRepository {
    constructor(cacheService, educationRepository) {
        this.cacheService = cacheService;
        this.educationRepository = educationRepository;
    }
    async findAllByIds(ids) {
        return await this.educationRepository.find({
            where: { id: (0, typeorm_2.In)(ids) },
        });
    }
    async findOneBy(where, includeComponents = false) {
        if (!includeComponents) {
            const education = await this.educationRepository.findOneBy(where);
            if (!education)
                throw new education_not_found_exception_1.EducationNotFoundException();
            return education;
        }
        const queryBuilder = this.educationRepository.createQueryBuilder('users_components_educations');
        const whereKeys = Object.keys(where);
        whereKeys.forEach((key, index) => {
            const paramKey = `param${index}`;
            const value = where[key];
            if (index === 0) {
                queryBuilder.where(`users_components_educations.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
            else {
                queryBuilder.andWhere(`users_components_educations.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
        });
        queryBuilder
            .leftJoinAndSelect('users_components_educations.certificates', 'certificates');
        const education = await queryBuilder.getOne();
        if (!education)
            throw new education_not_found_exception_1.EducationNotFoundException();
        return education;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'startDate';
        const cacheKey = this.cacheService.generateKey('educations', 'paginated', username, page, limit, validatedSortBy, sortOrder);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.educationRepository.findAndCount({
                skip,
                take: limit,
                relations: ['certificates'],
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
        const education = this.educationRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.educationRepository.save(education);
    }
    async update(id, data) {
        await this.educationRepository.update({ id }, data);
        return await this.educationRepository.findOne({
            where: { id },
            relations: ['certificates'],
        });
    }
    async delete(id) {
        await this.educationRepository.delete({ id });
    }
};
exports.EducationRepository = EducationRepository;
exports.EducationRepository = EducationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_component_education_entity_1.UserComponentEducation)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_2.Repository])
], EducationRepository);
;
//# sourceMappingURL=education.repository.js.map