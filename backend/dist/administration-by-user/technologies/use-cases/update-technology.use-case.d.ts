import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { UpdateTechnologyDto } from '../dto/update-technology.dto';
export declare class UpdateTechnologyUseCase {
    private readonly technologiesService;
    constructor(technologiesService: TechnologiesService);
    execute(id: number, username: string, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology>;
    private existsTechnologyName;
}
