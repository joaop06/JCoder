import { Repository } from 'typeorm';
import { GetCertificatesDto } from '../dto/get-certificates.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserComponentCertificate } from '../../administration-by-user/users/user-components/entities/user-component-certificate.entity';
export declare class GetCertificatesUseCase {
    private readonly cacheService;
    private readonly userRepository;
    private readonly certificateRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>, certificateRepository: Repository<UserComponentCertificate>);
    execute(username: string, paginationDto: PaginationDto): Promise<GetCertificatesDto>;
}
