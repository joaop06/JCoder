import { TechnologiesService } from '../../technologies/technologies.service';
import { TechnologiesStatsDto } from '../../technologies/dto/technologies-stats.dto';
export declare class GetTechnologiesStatsUseCase {
    private readonly technologiesService;
    constructor(technologiesService: TechnologiesService);
    execute(username: string): Promise<TechnologiesStatsDto>;
}
