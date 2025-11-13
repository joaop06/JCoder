import { JwtAuthGuard } from '../../@common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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

@ApiBearerAuth()
@Controller(':username/dashboard')
@ApiTags('Administration Dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getApplicationsStatsUseCase: GetApplicationsStatsUseCase,
    private readonly getTechnologiesStatsUseCase: GetTechnologiesStatsUseCase,
    private readonly getUnreadMessagesStatsUseCase: GetUnreadMessagesStatsUseCase,
    private readonly getProfileCompletenessUseCase: GetProfileCompletenessUseCase,
    private readonly getPortfolioEngagementStatsUseCase: GetPortfolioEngagementStatsUseCase,
  ) { }

  /**
   * Get applications statistics (lightweight endpoint for mobile)
   */
  @Get('applications/stats')
  @ApiOkResponse({ type: ApplicationsStatsDto })
  async getApplicationsStats(
    @Param('username') username: string,
  ): Promise<ApplicationsStatsDto> {
    return await this.getApplicationsStatsUseCase.execute(username);
  }

  /**
   * Get technologies statistics (lightweight endpoint for mobile)
   */
  @Get('technologies/stats')
  @ApiOkResponse({ type: TechnologiesStatsDto })
  async getTechnologiesStats(
    @Param('username') username: string,
  ): Promise<TechnologiesStatsDto> {
    return await this.getTechnologiesStatsUseCase.execute(username);
  }

  /**
   * Get unread messages statistics (lightweight endpoint for mobile)
   */
  @Get('messages/unread')
  @ApiOkResponse({ type: UnreadMessagesDto })
  async getUnreadMessagesStats(
    @Param('username') username: string,
  ): Promise<UnreadMessagesDto> {
    return await this.getUnreadMessagesStatsUseCase.execute(username);
  }

  /**
   * Get profile completeness (lightweight endpoint for mobile)
   */
  @Get('profile/completeness')
  @ApiOkResponse({ type: ProfileCompletenessDto })
  async getProfileCompleteness(
    @Param('username') username: string,
  ): Promise<ProfileCompletenessDto> {
    return await this.getProfileCompletenessUseCase.execute(username);
  }

  /**
   * Get portfolio engagement statistics
   * Returns views, unique visitors, and analytics data
   */
  @Get('engagement/stats')
  @ApiOkResponse({ type: PortfolioEngagementStatsDto })
  async getPortfolioEngagementStats(
    @Param('username') username: string,
    @Query() query: GetPortfolioEngagementQueryDto,
  ): Promise<PortfolioEngagementStatsDto> {
    return await this.getPortfolioEngagementStatsUseCase.execute(username, query);
  }
}
