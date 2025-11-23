import { Repository } from 'typeorm';
import { GetApplicationsDto } from '../dto/get-applications.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
export declare class GetApplicationsUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly applicationRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, applicationRepository: Repository<Application>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetApplicationsDto>;
}
