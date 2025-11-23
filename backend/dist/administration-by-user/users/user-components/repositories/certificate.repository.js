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
exports.CertificateRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const education_repository_1 = require("./education.repository");
const cache_service_1 = require("../../../../@common/services/cache.service");
const user_component_certificate_entity_1 = require("../entities/user-component-certificate.entity");
const certificate_not_found_exception_1 = require("../exceptions/certificate-not-found.exception");
let CertificateRepository = class CertificateRepository {
    constructor(cacheService, educationRepository, certificateRepository) {
        this.cacheService = cacheService;
        this.educationRepository = educationRepository;
        this.certificateRepository = certificateRepository;
    }
    async findOneBy(where, includeComponents = false) {
        if (!includeComponents) {
            const certificate = await this.certificateRepository.findOneBy(where);
            if (!certificate)
                throw new certificate_not_found_exception_1.CertificateNotFoundException();
            return certificate;
        }
        const queryBuilder = this.certificateRepository.createQueryBuilder('users_components_certificates');
        const whereKeys = Object.keys(where);
        whereKeys.forEach((key, index) => {
            const paramKey = `param${index}`;
            const value = where[key];
            if (index === 0) {
                queryBuilder.where(`users_components_certificates.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
            else {
                queryBuilder.andWhere(`users_components_certificates.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
        });
        queryBuilder
            .leftJoinAndSelect('users_components_certificates.educations', 'educations');
        const certificate = await queryBuilder.getOne();
        if (!certificate)
            throw new certificate_not_found_exception_1.CertificateNotFoundException();
        return certificate;
    }
    async findAll(username, paginationDto) {
        const { page = 1, limit = 10, sortBy = 'issueDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;
        const validSortFields = ['id', 'userId', 'certificateName', 'registrationNumber', 'verificationUrl', 'issueDate', 'issuedTo', 'profileImage'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'issueDate';
        const cacheKey = this.cacheService.generateKey('certificates', 'paginated', username, page, limit, validatedSortBy, sortOrder);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const [data, total] = await this.certificateRepository.findAndCount({
                skip,
                take: limit,
                relations: ['educations'],
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
        const { educationIds, educations, ...certificateData } = data;
        const certificate = this.certificateRepository.create({
            ...certificateData,
            userId: user.id,
            user,
        });
        const savedCertificate = await this.certificateRepository.save(certificate);
        if (educationIds && Array.isArray(educationIds) && educationIds.length > 0) {
            await this.setEducations(savedCertificate.certificateName, educationIds);
            return await this.findOneBy({ id: savedCertificate.id }, true);
        }
        return savedCertificate;
    }
    async update(id, data) {
        const { educationIds, educations, ...certificateData } = data;
        await this.certificateRepository.update({ id }, certificateData);
        if (educationIds !== undefined) {
            const certificate = await this.findOneBy({ id });
            if (certificate) {
                await this.setEducations(certificate.certificateName, Array.isArray(educationIds) ? educationIds : []);
            }
        }
        return await this.certificateRepository.findOne({
            where: { id },
            relations: ['educations'],
        });
    }
    async delete(id) {
        await this.certificateRepository.delete({ id });
    }
    async setEducations(certificateName, educationIds) {
        const certificate = await this.findOneBy({ certificateName });
        if (!certificate)
            return;
        const educations = educationIds.length > 0
            ? await this.educationRepository.findAllByIds(educationIds)
            : [];
        certificate.educations = educations;
        await this.certificateRepository.save(certificate);
    }
};
exports.CertificateRepository = CertificateRepository;
exports.CertificateRepository = CertificateRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_component_certificate_entity_1.UserComponentCertificate)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        education_repository_1.EducationRepository,
        typeorm_2.Repository])
], CertificateRepository);
;
//# sourceMappingURL=certificate.repository.js.map