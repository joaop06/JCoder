import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './entities/application.entity';
import { CacheService } from '../../@common/services/cache.service';
import { ApplicationsStatsDto } from './dto/applications-stats.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Technology } from '../technologies/entities/technology.entity';
import { ImageUploadService } from '../images/services/image-upload.service';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
export declare class ApplicationsService {
    private readonly cacheService;
    private readonly usersService;
    private readonly repository;
    private readonly imageUploadService;
    private readonly technologyRepository;
    constructor(cacheService: CacheService, usersService: UsersService, repository: Repository<Application>, imageUploadService: ImageUploadService, technologyRepository: Repository<Technology>);
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Application>>;
    findById(id: number, username: string): Promise<Application>;
    create(createApplicationDto: CreateApplicationDto & {
        displayOrder: number;
    }): Promise<Application>;
    update(id: number, updateApplicationDto: UpdateApplicationDto & {
        displayOrder?: number;
    }): Promise<Application>;
    delete(id: number): Promise<void>;
    incrementDisplayOrderFrom(startPosition: number, userId: number): Promise<void>;
    reorderOnUpdate(id: number, oldPosition: number, newPosition: number, username: string): Promise<void>;
    decrementDisplayOrderAfter(deletedPosition: number, username: string): Promise<void>;
    setApplicationTechnologies(applicationId: number, technologyIds?: number[]): Promise<void>;
    private getApplicationTechnologyIds;
    getStats(username: string): Promise<ApplicationsStatsDto>;
    existsByApplicationNameAndUsername(username: string, name: string): Promise<Application | null>;
}
