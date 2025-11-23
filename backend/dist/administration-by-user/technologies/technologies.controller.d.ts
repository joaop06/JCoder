import { Technology } from './entities/technology.entity';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { ReorderTechnologyDto } from './dto/reorder-technology.dto';
import { TechnologiesStatsDto } from './dto/technologies-stats.dto';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { ReorderTechnologyUseCase } from './use-cases/reorder-technology.use-case';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
export declare class TechnologiesController {
    private readonly technologiesService;
    private readonly createTechnologyUseCase;
    private readonly deleteTechnologyUseCase;
    private readonly updateTechnologyUseCase;
    private readonly reorderTechnologyUseCase;
    constructor(technologiesService: TechnologiesService, createTechnologyUseCase: CreateTechnologyUseCase, deleteTechnologyUseCase: DeleteTechnologyUseCase, updateTechnologyUseCase: UpdateTechnologyUseCase, reorderTechnologyUseCase: ReorderTechnologyUseCase);
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Technology>>;
    getStats(username: string): Promise<TechnologiesStatsDto>;
    findById(username: string, id: number): Promise<Technology>;
    create(username: string, createTechnologyDto: CreateTechnologyDto): Promise<Technology>;
    update(username: string, id: number, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology>;
    delete(username: string, id: number): Promise<void>;
    reorder(username: string, id: number, reorderTechnologyDto: ReorderTechnologyDto): Promise<Technology>;
}
