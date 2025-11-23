import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { ReorderTechnologyDto } from '../dto/reorder-technology.dto';
export declare class ReorderTechnologyUseCase {
    private readonly technologiesService;
    constructor(technologiesService: TechnologiesService);
    execute(username: string, id: number, reorderTechnologyDto: ReorderTechnologyDto): Promise<Technology>;
}
