import { GetPortfolioEngagementQueryDto } from '../../../portfolio-view/dto/get-portfolio-engagement-query.dto';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PortfolioEngagementStatsDto } from '../dto/portfolio-engagement-stats.dto';
import { PortfolioView } from '../../../portfolio-view/entities/portfolio-view.entity';
export declare class GetPortfolioEngagementStatsUseCase {
    private readonly portfolioViewRepository;
    private readonly userRepository;
    constructor(portfolioViewRepository: Repository<PortfolioView>, userRepository: Repository<User>);
    execute(username: string, query: GetPortfolioEngagementQueryDto): Promise<PortfolioEngagementStatsDto>;
    private calculateDateRange;
    private getDailyStats;
    private getTopCountries;
    private getTopReferers;
}
