import { ApplicationsService } from "../applications.service";
export declare class DeleteApplicationUseCase {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    execute(username: string, id: number): Promise<void>;
}
