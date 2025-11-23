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
exports.AboutMeRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const users_service_1 = require("../../users.service");
const cache_service_1 = require("../../../../@common/services/cache.service");
const user_component_about_me_entity_1 = require("../entities/user-component-about-me.entity");
const user_component_about_me_highlight_entity_1 = require("../entities/user-component-about-me-highlight.entity");
let AboutMeRepository = class AboutMeRepository {
    constructor(cacheService, usersService, aboutMeRepository, aboutMeHighlightRepository) {
        this.cacheService = cacheService;
        this.usersService = usersService;
        this.aboutMeRepository = aboutMeRepository;
        this.aboutMeHighlightRepository = aboutMeHighlightRepository;
    }
    async findByUsername(username) {
        const cacheKey = this.cacheService.generateKey('about-me', 'paginated', username);
        return await this.cacheService.getOrSet(cacheKey, async () => {
            const aboutMe = await this.aboutMeRepository.findOne({
                relations: ['highlights'],
                where: { user: { username } },
            });
            return aboutMe;
        }, 300);
    }
    async create(user, data) {
        const aboutMe = this.aboutMeRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.aboutMeRepository.save(aboutMe);
    }
    async update(username, data) {
        const user = await this.usersService.findOneBy({ username });
        const { highlights, ...aboutMeData } = data;
        await this.aboutMeRepository.update({ userId: user.id }, aboutMeData);
        if (highlights !== undefined) {
            const aboutMe = await this.aboutMeRepository.findOne({ where: { userId: user.id } });
            if (aboutMe) {
                await this.saveHighlights(aboutMe.id, highlights);
            }
        }
        return await this.aboutMeRepository.findOne({
            where: { userId: user.id },
            relations: ['highlights'],
        });
    }
    async createHighlight(aboutMeId, data) {
        const highlight = this.aboutMeHighlightRepository.create({
            ...data,
            aboutMeId,
        });
        return await this.aboutMeHighlightRepository.save(highlight);
    }
    async saveHighlights(aboutMeId, highlights) {
        await this.deleteHighlights(aboutMeId);
        const savedHighlights = [];
        for (const highlight of highlights) {
            const saved = await this.createHighlight(aboutMeId, highlight);
            savedHighlights.push(saved);
        }
        return savedHighlights;
    }
    async deleteHighlights(aboutMeId) {
        await this.aboutMeHighlightRepository.delete({
            aboutMeId,
        });
    }
};
exports.AboutMeRepository = AboutMeRepository;
exports.AboutMeRepository = AboutMeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(user_component_about_me_entity_1.UserComponentAboutMe)),
    __param(3, (0, typeorm_2.InjectRepository)(user_component_about_me_highlight_entity_1.UserComponentAboutMeHighlight)),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        users_service_1.UsersService,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AboutMeRepository);
;
//# sourceMappingURL=about-me.repository.js.map