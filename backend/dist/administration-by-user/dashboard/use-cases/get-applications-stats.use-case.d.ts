import { ApplicationsService } from '../../applications/applications.service';
import { ApplicationsStatsDto } from '../../applications/dto/applications-stats.dto';
export declare class GetApplicationsStatsUseCase {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    execute(username: string): Promise<ApplicationsStatsDto>;
}
