import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';
export declare class DashboardService {
    private readonly getApplicationsStatsUseCase;
    private readonly getTechnologiesStatsUseCase;
    private readonly getUnreadMessagesStatsUseCase;
    private readonly getProfileCompletenessUseCase;
    constructor(getApplicationsStatsUseCase: GetApplicationsStatsUseCase, getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase, getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase, getProfileCompletenessUseCase: GetProfileCompletenessUseCase);
    getDashboardData(username: string): Promise<DashboardResponseDto>;
}
