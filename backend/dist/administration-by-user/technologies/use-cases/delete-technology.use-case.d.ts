import { TechnologiesService } from '../technologies.service';
export declare class DeleteTechnologyUseCase {
    private readonly technologiesService;
    constructor(technologiesService: TechnologiesService);
    execute(username: string, id: number): Promise<void>;
}
