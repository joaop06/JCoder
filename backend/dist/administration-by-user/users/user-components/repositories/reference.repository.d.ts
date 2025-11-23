import { User } from '../../entities/user.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentReference } from '../entities/user-component-reference.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentReferenceDto } from '../dto/create-user-component-reference.dto';
import { UpdateUserComponentReferenceDto } from '../dto/update-user-component-reference.dto';
export declare class ReferenceRepository {
    private readonly cacheService;
    private readonly referenceRepository;
    constructor(cacheService: CacheService, referenceRepository: Repository<UserComponentReference>);
    findOneBy(where: FindOptionsWhere<UserComponentReference>): Promise<UserComponentReference>;
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentReference>>;
    create(user: User, data: CreateUserComponentReferenceDto): Promise<UserComponentReference>;
    update(id: number, data: UpdateUserComponentReferenceDto): Promise<UserComponentReference>;
    delete(id: number): Promise<void>;
}
