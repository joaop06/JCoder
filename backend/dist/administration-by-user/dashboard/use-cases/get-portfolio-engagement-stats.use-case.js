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
exports.GetPortfolioEngagementStatsUseCase = void 0;
const get_portfolio_engagement_query_dto_1 = require("../../../portfolio-view/dto/get-portfolio-engagement-query.dto");
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const portfolio_view_entity_1 = require("../../../portfolio-view/entities/portfolio-view.entity");
const user_not_found_exception_1 = require("../../users/exceptions/user-not-found.exception");
let GetPortfolioEngagementStatsUseCase = class GetPortfolioEngagementStatsUseCase {
    constructor(portfolioViewRepository, userRepository) {
        this.portfolioViewRepository = portfolioViewRepository;
        this.userRepository = userRepository;
    }
    async execute(username, query) {
        const user = await this.userRepository.findOne({
            where: { username },
        });
        if (!user) {
            throw new user_not_found_exception_1.UserNotFoundException();
        }
        const { startDate, endDate } = this.calculateDateRange(query);
        const queryBuilder = this.portfolioViewRepository
            .createQueryBuilder('view')
            .where('view.userId = :userId', { userId: user.id })
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate });
        const totalViews = await queryBuilder
            .andWhere('view.isOwner = false')
            .getCount();
        const ownerViews = await this.portfolioViewRepository
            .createQueryBuilder('view')
            .where('view.userId = :userId', { userId: user.id })
            .andWhere('view.isOwner = true')
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate })
            .getCount();
        const uniqueVisitorsQuery = await queryBuilder
            .andWhere('view.isOwner = false')
            .select('DISTINCT CONCAT(COALESCE(view.ipAddress, ""), "-", COALESCE(view.fingerprint, ""))', 'visitor')
            .getRawMany();
        const uniqueVisitors = new Set(uniqueVisitorsQuery.map((v) => v.visitor)).size;
        const dailyStats = await this.getDailyStats(user.id, startDate, endDate);
        const topCountries = await this.getTopCountries(user.id, startDate, endDate);
        const topReferers = await this.getTopReferers(user.id, startDate, endDate);
        return {
            totalViews,
            uniqueVisitors,
            ownerViews,
            dailyStats,
            topCountries,
            topReferers,
        };
    }
    calculateDateRange(query) {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        let startDate = new Date();
        switch (query.rangeType) {
            case get_portfolio_engagement_query_dto_1.DateRangeType.DAY:
                startDate.setHours(0, 0, 0, 0);
                break;
            case get_portfolio_engagement_query_dto_1.DateRangeType.WEEK:
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case get_portfolio_engagement_query_dto_1.DateRangeType.MONTH:
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case get_portfolio_engagement_query_dto_1.DateRangeType.YEAR:
                startDate.setFullYear(startDate.getFullYear() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case get_portfolio_engagement_query_dto_1.DateRangeType.CUSTOM:
                if (query.startDate && query.endDate) {
                    startDate = new Date(query.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setTime(new Date(query.endDate).getTime());
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
        }
        return { startDate, endDate };
    }
    async getDailyStats(userId, startDate, endDate) {
        const results = await this.portfolioViewRepository
            .createQueryBuilder('view')
            .select('DATE(view.createdAt)', 'date')
            .addSelect('COUNT(*)', 'views')
            .where('view.userId = :userId', { userId })
            .andWhere('view.isOwner = false')
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate })
            .groupBy('DATE(view.createdAt)')
            .orderBy('DATE(view.createdAt)', 'ASC')
            .getRawMany();
        const dailyUniqueVisitors = await this.portfolioViewRepository
            .createQueryBuilder('view')
            .select('DATE(view.createdAt)', 'date')
            .addSelect('CONCAT(COALESCE(view.ipAddress, ""), "-", COALESCE(view.fingerprint, ""))', 'visitor')
            .where('view.userId = :userId', { userId })
            .andWhere('view.isOwner = false')
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate })
            .getRawMany();
        const uniqueByDate = new Map();
        dailyUniqueVisitors.forEach((row) => {
            const date = row.date.toISOString().split('T')[0];
            if (!uniqueByDate.has(date)) {
                uniqueByDate.set(date, new Set());
            }
            uniqueByDate.get(date).add(row.visitor);
        });
        return results.map((row) => {
            const date = row.date.toISOString().split('T')[0];
            return {
                date,
                views: parseInt(row.views, 10),
                uniqueVisitors: uniqueByDate.get(date)?.size || 0,
            };
        });
    }
    async getTopCountries(userId, startDate, endDate) {
        const results = await this.portfolioViewRepository
            .createQueryBuilder('view')
            .select('view.country', 'country')
            .addSelect('COUNT(*)', 'count')
            .where('view.userId = :userId', { userId })
            .andWhere('view.isOwner = false')
            .andWhere('view.country IS NOT NULL')
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate })
            .groupBy('view.country')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        return results.map((row) => ({
            country: row.country,
            count: parseInt(row.count, 10),
        }));
    }
    async getTopReferers(userId, startDate, endDate) {
        const results = await this.portfolioViewRepository
            .createQueryBuilder('view')
            .select('view.referer', 'referer')
            .addSelect('COUNT(*)', 'count')
            .where('view.userId = :userId', { userId })
            .andWhere('view.isOwner = false')
            .andWhere('view.referer IS NOT NULL')
            .andWhere('view.referer != ""')
            .andWhere('view.createdAt >= :startDate', { startDate })
            .andWhere('view.createdAt <= :endDate', { endDate })
            .groupBy('view.referer')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        return results.map((row) => ({
            referer: row.referer,
            count: parseInt(row.count, 10),
        }));
    }
};
exports.GetPortfolioEngagementStatsUseCase = GetPortfolioEngagementStatsUseCase;
exports.GetPortfolioEngagementStatsUseCase = GetPortfolioEngagementStatsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(portfolio_view_entity_1.PortfolioView)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], GetPortfolioEngagementStatsUseCase);
//# sourceMappingURL=get-portfolio-engagement-stats.use-case.js.map