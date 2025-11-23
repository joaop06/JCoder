import { Repository } from 'typeorm';
import { CacheService } from '../../@common/services/cache.service';
import { GetApplicationDetailsDto } from '../dto/get-application-details.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
export declare class GetApplicationDetailsUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly applicationRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, applicationRepository: Repository<Application>);
    execute(id: number, username: string): Promise<GetApplicationDetailsDto>;
}
