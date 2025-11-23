import {
  DateRangeType,
  GetPortfolioEngagementQueryDto,
} from '../../../portfolio-view/dto/get-portfolio-engagement-query.dto';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { PortfolioEngagementStatsDto } from '../dto/portfolio-engagement-stats.dto';
import { PortfolioView } from '../../../portfolio-view/entities/portfolio-view.entity';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

@Injectable()
export class GetPortfolioEngagementStatsUseCase {
  constructor(
    @InjectRepository(PortfolioView)
    private readonly portfolioViewRepository: Repository<PortfolioView>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(
    username: string,
    query: GetPortfolioEngagementQueryDto,
  ): Promise<PortfolioEngagementStatsDto> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Calcular range de datas
    const { startDate, endDate } = this.calculateDateRange(query);

    // Query base
    const queryBuilder = this.portfolioViewRepository
      .createQueryBuilder('view')
      .where('view.userId = :userId', { userId: user.id })
      .andWhere('view.createdAt >= :startDate', { startDate })
      .andWhere('view.createdAt <= :endDate', { endDate });

    // Total de acessos (excluindo dono)
    const totalViews = await queryBuilder
      .andWhere('view.isOwner = false')
      .getCount();

    // Acessos do dono
    const ownerViews = await this.portfolioViewRepository
      .createQueryBuilder('view')
      .where('view.userId = :userId', { userId: user.id })
      .andWhere('view.isOwner = true')
      .andWhere('view.createdAt >= :startDate', { startDate })
      .andWhere('view.createdAt <= :endDate', { endDate })
      .getCount();

    // Unique visitors (based on IP + fingerprint)
    const uniqueVisitorsQuery = await queryBuilder
      .andWhere('view.isOwner = false')
      .select('DISTINCT CONCAT(COALESCE(view.ipAddress, ""), "-", COALESCE(view.fingerprint, ""))', 'visitor')
      .getRawMany();

    const uniqueVisitors = new Set(uniqueVisitorsQuery.map((v) => v.visitor)).size;

    // Daily statistics
    const dailyStats = await this.getDailyStats(user.id, startDate, endDate);

    // Top countries
    const topCountries = await this.getTopCountries(user.id, startDate, endDate);

    // Top referrers
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

  private calculateDateRange(
    query: GetPortfolioEngagementQueryDto,
  ): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date();

    switch (query.rangeType) {
      case DateRangeType.DAY:
        startDate.setHours(0, 0, 0, 0);
        break;

      case DateRangeType.WEEK:
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case DateRangeType.MONTH:
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case DateRangeType.YEAR:
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case DateRangeType.CUSTOM:
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

  private async getDailyStats(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; views: number; uniqueVisitors: number }>> {
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

    // Calculate unique visitors per day
    const dailyUniqueVisitors = await this.portfolioViewRepository
      .createQueryBuilder('view')
      .select('DATE(view.createdAt)', 'date')
      .addSelect('CONCAT(COALESCE(view.ipAddress, ""), "-", COALESCE(view.fingerprint, ""))', 'visitor')
      .where('view.userId = :userId', { userId })
      .andWhere('view.isOwner = false')
      .andWhere('view.createdAt >= :startDate', { startDate })
      .andWhere('view.createdAt <= :endDate', { endDate })
      .getRawMany();

    // Group by date and count unique visitors
    const uniqueByDate = new Map<string, Set<string>>();
    dailyUniqueVisitors.forEach((row) => {
      const date = row.date.toISOString().split('T')[0];
      if (!uniqueByDate.has(date)) {
        uniqueByDate.set(date, new Set());
      }
      uniqueByDate.get(date)!.add(row.visitor);
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

  private async getTopCountries(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ country: string; count: number }>> {
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

  private async getTopReferers(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ referer: string; count: number }>> {
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
}

