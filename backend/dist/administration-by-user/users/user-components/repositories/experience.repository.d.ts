import { User } from '../../entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentExperienceDto } from '../dto/create-user-component-experience.dto';
import { UpdateUserComponentExperienceDto } from '../dto/update-user-component-experience.dto';
import { UserComponentExperiencePosition } from '../entities/user-component-experience-position.entity';
export declare class ExperienceRepository {
    private readonly cacheService;
    private readonly experienceRepository;
    private readonly experiencePositionRepository;
    constructor(cacheService: CacheService, experienceRepository: Repository<UserComponentExperience>, experiencePositionRepository: Repository<UserComponentExperiencePosition>);
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>>;
    create(user: User, data: CreateUserComponentExperienceDto): Promise<UserComponentExperience>;
    update(id: number, data: UpdateUserComponentExperienceDto): Promise<UserComponentExperience>;
    delete(id: number): Promise<void>;
    createPosition(experienceId: number, data: Partial<UserComponentExperiencePosition>): Promise<UserComponentExperiencePosition>;
    savePositions(experienceId: number, positions: Partial<UserComponentExperiencePosition>[]): Promise<UserComponentExperiencePosition[]>;
    deletePositions(where: FindOptionsWhere<UserComponentExperiencePosition>): Promise<void>;
}
