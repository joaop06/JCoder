import { Repository } from 'typeorm';
import { GetTechnologiesDto } from '../dto/get-technologies.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Technology } from '../../administration-by-user/technologies/entities/technology.entity';
export declare class GetTechnologiesUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly technologyRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, technologyRepository: Repository<Technology>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetTechnologiesDto>;
}
