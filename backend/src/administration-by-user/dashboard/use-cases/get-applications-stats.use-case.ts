import { Injectable } from '@nestjs/common';
import { ApplicationsService } from '../../applications/applications.service';
import { ApplicationsStatsDto } from '../../applications/dto/applications-stats.dto';

@Injectable()
export class GetApplicationsStatsUseCase {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  async execute(username: string): Promise<ApplicationsStatsDto> {
    return await this.applicationsService.getStats(username);
  }
}

