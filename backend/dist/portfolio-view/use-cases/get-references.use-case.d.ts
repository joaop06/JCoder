import { Repository } from 'typeorm';
import { GetReferencesDto } from '../dto/get-references.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserComponentReference } from '../../administration-by-user/users/user-components/entities/user-component-reference.entity';
export declare class GetReferencesUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly referenceRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, referenceRepository: Repository<UserComponentReference>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetReferencesDto>;
}
