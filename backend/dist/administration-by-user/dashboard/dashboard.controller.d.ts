import { ApplicationsStatsDto } from '../applications/dto/applications-stats.dto';
import { TechnologiesStatsDto } from '../technologies/dto/technologies-stats.dto';
import { PortfolioEngagementStatsDto } from './dto/portfolio-engagement-stats.dto';
import { ProfileCompletenessDto, UnreadMessagesDto } from './dto/dashboard-response.dto';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { GetPortfolioEngagementStatsUseCase } from './use-cases/get-portfolio-engagement-stats.use-case';
import { GetPortfolioEngagementQueryDto } from '../../portfolio-view/dto/get-portfolio-engagement-query.dto';
export declare class DashboardController {
    private readonly getApplicationsStatsUseCase;
    private readonly getTechnologiesStatsUseCase;
    private readonly getUnreadMessagesStatsUseCase;
    private readonly getProfileCompletenessUseCase;
    private readonly getPortfolioEngagementStatsUseCase;
    constructor(getApplicationsStatsUseCase: GetApplicationsStatsUseCase, getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase, getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase, getProfileCompletenessUseCase: GetProfileCompletenessUseCase, getPortfolioEngagementStatsUseCase: GetPortfolioEngagementStatsUseCase);
    getApplicationsStats(username: string): Promise<ApplicationsStatsDto>;
    getTechnologiesStats(username: string): Promise<TechnologiesStatsDto>;
    getUnreadMessagesStats(username: string): Promise<UnreadMessagesDto>;
    getProfileCompleteness(username: string): Promise<ProfileCompletenessDto>;
    getPortfolioEngagementStats(username: string, query: GetPortfolioEngagementQueryDto): Promise<PortfolioEngagementStatsDto>;
}
