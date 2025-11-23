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
exports.GetProfileWithAboutMeUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const class_transformer_1 = require("class-transformer");
const cache_service_1 = require("../../@common/services/cache.service");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const get_profile_with_about_me_dto_1 = require("../dto/get-profile-with-about-me.dto");
const user_not_found_exception_1 = require("../../administration-by-user/users/exceptions/user-not-found.exception");
let GetProfileWithAboutMeUseCase = class GetProfileWithAboutMeUseCase {
    constructor(cacheService, userRepository) {
        this.cacheService = cacheService;
        this.userRepository = userRepository;
    }
    async execute(username) {
        const cacheKey = this.cacheService.generateKey('portfolio', 'profile', username);
        const user = await this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .where('user.username = :username', { username })
                .leftJoinAndSelect('user.userComponentAboutMe', 'aboutMe')
                .leftJoinAndSelect('aboutMe.highlights', 'highlights')
                .select([
                'user.id',
                'user.username',
                'user.firstName',
                'user.fullName',
                'user.email',
                'user.githubUrl',
                'user.linkedinUrl',
                'user.profileImage',
                'user.createdAt',
                'user.updatedAt',
                'aboutMe.id',
                'aboutMe.userId',
                'aboutMe.occupation',
                'aboutMe.description',
                'highlights.id',
                'highlights.aboutMeId',
                'highlights.title',
                'highlights.subtitle',
                'highlights.emoji',
            ])
                .getOne();
            if (!user)
                throw new user_not_found_exception_1.UserNotFoundException();
            return user;
        }, 600);
        return (0, class_transformer_1.plainToInstance)(get_profile_with_about_me_dto_1.GetProfileWithAboutMeDto, user);
    }
};
exports.GetProfileWithAboutMeUseCase = GetProfileWithAboutMeUseCase;
exports.GetProfileWithAboutMeUseCase = GetProfileWithAboutMeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        typeorm_1.Repository])
], GetProfileWithAboutMeUseCase);
;
//# sourceMappingURL=get-profile-with-about-me.use-case.js.map