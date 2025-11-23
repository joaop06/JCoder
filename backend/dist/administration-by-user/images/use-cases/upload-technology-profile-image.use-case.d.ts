import { Repository } from 'typeorm';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
export declare class UploadTechnologyProfileImageUseCase {
    private readonly imageStorageService;
    private readonly technologyRepository;
    constructor(imageStorageService: ImageStorageService, technologyRepository: Repository<Technology>);
    execute(id: number, file: Express.Multer.File): Promise<Technology>;
}
