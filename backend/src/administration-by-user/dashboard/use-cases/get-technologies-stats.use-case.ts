import { Injectable } from '@nestjs/common';
import { TechnologiesService } from '../../technologies/technologies.service';
import { TechnologiesStatsDto } from '../../technologies/dto/technologies-stats.dto';

@Injectable()
export class GetTechnologiesStatsUseCase {
  constructor(
    private readonly technologiesService: TechnologiesService,
  ) {}

  async execute(username: string): Promise<TechnologiesStatsDto> {
    return await this.technologiesService.getStats(username);
  }
}

