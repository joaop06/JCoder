import { Repository } from 'typeorm';
import { CacheService } from '../../@common/services/cache.service';
import { Application } from '../applications/entities/application.entity';
export declare class ImagesService {
    private readonly cacheService;
    private readonly applicationRepository;
    constructor(cacheService: CacheService, applicationRepository: Repository<Application>);
    findApplicationById(id: number): Promise<Application>;
}
