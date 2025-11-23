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
exports.GetProfileCompletenessUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../../users/users.service");
const cache_service_1 = require("../../../@common/services/cache.service");
const user_component_about_me_entity_1 = require("../../users/user-components/entities/user-component-about-me.entity");
const user_component_education_entity_1 = require("../../users/user-components/entities/user-component-education.entity");
const user_component_experience_entity_1 = require("../../users/user-components/entities/user-component-experience.entity");
const user_component_certificate_entity_1 = require("../../users/user-components/entities/user-component-certificate.entity");
const user_component_reference_entity_1 = require("../../users/user-components/entities/user-component-reference.entity");
let GetProfileCompletenessUseCase = class GetProfileCompletenessUseCase {
    constructor(usersService, cacheService, aboutMeRepository, educationRepository, experienceRepository, certificateRepository, referenceRepository) {
        this.usersService = usersService;
        this.cacheService = cacheService;
        this.aboutMeRepository = aboutMeRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.certificateRepository = certificateRepository;
        this.referenceRepository = referenceRepository;
    }
    async execute(username) {
        const cacheKey = this.cacheService.generateKey('dashboard', 'profile-completeness', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.usersService.findOneBy({ username });
            if (!user) {
                return this.getEmptyCompleteness();
            }
            const [hasAboutMe, educationCount, experienceCount, certificateCount, referenceCount] = await Promise.all([
                this.aboutMeRepository.count({ where: { userId: user.id } }),
                this.educationRepository.count({ where: { user: { id: user.id } } }),
                this.experienceRepository.count({ where: { user: { id: user.id } } }),
                this.certificateRepository.count({ where: { user: { id: user.id } } }),
                this.referenceRepository.count({ where: { user: { id: user.id } } }),
            ]);
            const fields = {
                profileImage: !!user.profileImage,
                fullName: !!user.fullName,
                email: !!user.email,
                phone: !!user.phone,
                address: !!user.address,
                githubUrl: !!user.githubUrl,
                linkedinUrl: !!user.linkedinUrl,
                aboutMe: hasAboutMe > 0,
                education: educationCount > 0,
                experience: experienceCount > 0,
                certificates: certificateCount > 0,
                references: referenceCount > 0,
            };
            const completedFields = Object.values(fields).filter(Boolean).length;
            const totalFields = Object.keys(fields).length;
            const percentage = Math.round((completedFields / totalFields) * 100);
            return {
                fields,
                percentage,
                totalFields,
                completedFields,
            };
        }, 300);
    }
    getEmptyCompleteness() {
        return {
            percentage: 0,
            completedFields: 0,
            totalFields: 12,
            fields: {
                profileImage: false,
                fullName: false,
                email: false,
                phone: false,
                address: false,
                githubUrl: false,
                linkedinUrl: false,
                aboutMe: false,
                education: false,
                experience: false,
                certificates: false,
                references: false,
            },
        };
    }
};
exports.GetProfileCompletenessUseCase = GetProfileCompletenessUseCase;
exports.GetProfileCompletenessUseCase = GetProfileCompletenessUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_component_about_me_entity_1.UserComponentAboutMe)),
    __param(3, (0, typeorm_1.InjectRepository)(user_component_education_entity_1.UserComponentEducation)),
    __param(4, (0, typeorm_1.InjectRepository)(user_component_experience_entity_1.UserComponentExperience)),
    __param(5, (0, typeorm_1.InjectRepository)(user_component_certificate_entity_1.UserComponentCertificate)),
    __param(6, (0, typeorm_1.InjectRepository)(user_component_reference_entity_1.UserComponentReference)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        cache_service_1.CacheService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GetProfileCompletenessUseCase);
//# sourceMappingURL=get-profile-completeness.use-case.js.map