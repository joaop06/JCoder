import { Repository } from 'typeorm';
import { Technology } from './entities/technology.entity';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { CacheService } from '../../@common/services/cache.service';
import { TechnologiesStatsDto } from './dto/technologies-stats.dto';
import { ImageUploadService } from '../images/services/image-upload.service';
import { UsersService } from '../users/users.service';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
export declare class TechnologiesService {
    private readonly cacheService;
    private readonly usersService;
    private readonly repository;
    private readonly imageUploadService;
    constructor(cacheService: CacheService, usersService: UsersService, repository: Repository<Technology>, imageUploadService: ImageUploadService);
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Technology>>;
    findById(id: number, username: string): Promise<Technology>;
    create(createTechnologyDto: CreateTechnologyDto): Promise<Technology>;
    update(id: number, updateTechnologyDto: UpdateTechnologyDto & {
        displayOrder?: number;
    }): Promise<Technology>;
    delete(id: number): Promise<void>;
    incrementDisplayOrderFrom(startPosition: number, userId: number): Promise<void>;
    reorderOnUpdate(id: number, oldPosition: number, newPosition: number, username: string): Promise<void>;
    decrementDisplayOrderAfter(deletedPosition: number, username: string): Promise<void>;
    getStats(username: string): Promise<TechnologiesStatsDto>;
    existsByTechnologyNameAndUsername(username: string, name: string): Promise<Technology | null>;
}
