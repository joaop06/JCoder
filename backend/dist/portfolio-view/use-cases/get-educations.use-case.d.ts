import { Repository } from 'typeorm';
import { GetEducationsDto } from '../dto/get-educations.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserComponentEducation } from '../../administration-by-user/users/user-components/entities/user-component-education.entity';
export declare class GetEducationsUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly educationRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, educationRepository: Repository<UserComponentEducation>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetEducationsDto>;
}
