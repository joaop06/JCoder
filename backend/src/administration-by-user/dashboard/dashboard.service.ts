import {
  UnreadMessagesDto,
  DashboardResponseDto,
  ProfileCompletenessDto,
} from './dto/dashboard-response.dto';
import { Injectable } from '@nestjs/common';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';

@Injectable()
export class DashboardService {
  constructor(
    private readonly getApplicationsStatsUseCase: GetApplicationsStatsUseCase,
    private readonly getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase,
    private readonly getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase,
    private readonly getProfileCompletenessUseCase: GetProfileCompletenessUseCase,
  ) { }

  /**
   * Get all dashboard data aggregated (for cases that need everything)
   * Note: For mobile, prefer using individual endpoints for better performance
   */
  async getDashboardData(username: string): Promise<DashboardResponseDto> {
    const [applications, technologies, unreadMessages, profileCompleteness] =
      await Promise.all([
        this.getApplicationsStatsUseCase.execute(username),
        this.getTechnologiesStatsUseCase.execute(username),
        this.getUnreadMessagesStatsUseCase.execute(username),
        this.getProfileCompletenessUseCase.execute(username),
      ]);

    return {
      applications,
      technologies,
      unreadMessages,
      profileCompleteness,
    };
  }
}
