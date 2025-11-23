import { Repository } from 'typeorm';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
export declare class GetTechnologyProfileImageUseCase {
    private readonly imageStorageService;
    private readonly technologyRepository;
    constructor(imageStorageService: ImageStorageService, technologyRepository: Repository<Technology>);
    execute(id: number): Promise<string>;
}
