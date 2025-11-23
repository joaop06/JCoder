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
exports.RegisterPortfolioViewUseCase = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const portfolio_view_entity_1 = require("../entities/portfolio-view.entity");
const user_entity_1 = require("../../administration-by-user/users/entities/user.entity");
const user_not_found_exception_1 = require("../../administration-by-user/users/exceptions/user-not-found.exception");
let RegisterPortfolioViewUseCase = class RegisterPortfolioViewUseCase {
    constructor(portfolioViewRepository, userRepository) {
        this.portfolioViewRepository = portfolioViewRepository;
        this.userRepository = userRepository;
        this.COOLDOWN_MINUTES = 30;
    }
    async execute(username, dto, request) {
        const user = await this.userRepository.findOne({
            where: { username },
        });
        if (!user) {
            throw new user_not_found_exception_1.UserNotFoundException();
        }
        const ipAddress = this.getClientIp(request);
        const fingerprint = dto.fingerprint?.trim() || null;
        const userAgent = request.headers['user-agent'] || null;
        const referer = (dto.referer || request.headers['referer'] || null)?.trim() || null;
        if (dto.isOwner === true) {
            await this.portfolioViewRepository.save({
                userId: user.id,
                ipAddress: ipAddress,
                fingerprint: fingerprint,
                userAgent: userAgent,
                referer: referer,
                isOwner: true,
            });
            return;
        }
        const cooldownDate = new Date();
        cooldownDate.setMinutes(cooldownDate.getMinutes() - this.COOLDOWN_MINUTES);
        const queryBuilder = this.portfolioViewRepository
            .createQueryBuilder('view')
            .where('view.userId = :userId', { userId: user.id })
            .andWhere('view.isOwner = false')
            .andWhere('view.createdAt >= :cooldownDate', { cooldownDate });
        const conditions = [];
        const params = {};
        if (ipAddress) {
            conditions.push('view.ipAddress = :ipAddress');
            params.ipAddress = ipAddress;
        }
        if (fingerprint) {
            conditions.push('view.fingerprint = :fingerprint');
            params.fingerprint = fingerprint;
        }
        if (conditions.length > 0) {
            queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
            const existingView = await queryBuilder
                .orderBy('view.createdAt', 'DESC')
                .getOne();
            if (existingView) {
                return;
            }
        }
        await this.portfolioViewRepository.save({
            userId: user.id,
            ipAddress: ipAddress,
            fingerprint: fingerprint,
            userAgent: userAgent,
            referer: referer,
            isOwner: false,
        });
    }
    getClientIp(request) {
        try {
            const forwarded = request.headers['x-forwarded-for'];
            if (forwarded) {
                const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
                const ip = ips.split(',')[0].trim();
                if (ip && ip.length > 0 && ip.length <= 45) {
                    return ip;
                }
            }
            const ip = request.ip || request.socket.remoteAddress;
            if (ip && ip.length > 0 && ip.length <= 45) {
                return ip;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
};
exports.RegisterPortfolioViewUseCase = RegisterPortfolioViewUseCase;
exports.RegisterPortfolioViewUseCase = RegisterPortfolioViewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(portfolio_view_entity_1.PortfolioView)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], RegisterPortfolioViewUseCase);
;
//# sourceMappingURL=register-portfolio-view.use-case.js.map