import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { ApplicationComponentsService } from "../application-components/application-components.service";
export declare class DeleteApplicationComponentUseCase {
    private readonly applicationsService;
    private readonly applicationComponentsService;
    constructor(applicationsService: ApplicationsService, applicationComponentsService: ApplicationComponentsService);
    execute(username: string, applicationId: number, componentType: 'api' | 'mobile' | 'library' | 'frontend'): Promise<Application>;
}
