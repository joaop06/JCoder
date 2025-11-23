import { Repository } from 'typeorm';
import { GetExperiencesDto } from '../dto/get-experiences.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserComponentExperience } from '../../administration-by-user/users/user-components/entities/user-component-experience.entity';
export declare class GetExperiencesUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly experienceRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, experienceRepository: Repository<UserComponentExperience>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetExperiencesDto>;
}
