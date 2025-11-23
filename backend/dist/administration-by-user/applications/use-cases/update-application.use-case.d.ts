import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { UpdateApplicationDto } from "../dto/update-application.dto";
import { ApplicationComponentsService } from "../application-components/application-components.service";
export declare class UpdateApplicationUseCase {
    private readonly applicationsService;
    private readonly applicationComponentsService;
    constructor(applicationsService: ApplicationsService, applicationComponentsService: ApplicationComponentsService);
    execute(username: string, id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application>;
    private existsApplicationName;
}
