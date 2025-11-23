import { Repository } from 'typeorm';
import { ImagesService } from '../images.service';
import { ImageStorageService } from '../services/image-storage.service';
import { CacheService } from '../../../@common/services/cache.service';
import { Application } from '../../applications/entities/application.entity';
export declare class UploadProfileImageUseCase {
    private readonly cacheService;
    private readonly imagesService;
    private readonly imageStorageService;
    private readonly applicationRepository;
    constructor(cacheService: CacheService, imagesService: ImagesService, imageStorageService: ImageStorageService, applicationRepository: Repository<Application>);
    execute(id: number, file: Express.Multer.File): Promise<Application>;
}
