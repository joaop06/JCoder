import { User } from '../../entities/user.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentEducationDto } from '../dto/create-user-component-education.dto';
import { UpdateUserComponentEducationDto } from '../dto/update-user-component-education.dto';
export declare class EducationRepository {
    private readonly cacheService;
    private readonly educationRepository;
    constructor(cacheService: CacheService, educationRepository: Repository<UserComponentEducation>);
    findAllByIds(ids: number[]): Promise<UserComponentEducation[]>;
    findOneBy(where: FindOptionsWhere<UserComponentEducation>, includeComponents?: boolean): Promise<UserComponentEducation>;
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>>;
    create(user: User, data: CreateUserComponentEducationDto): Promise<UserComponentEducation>;
    update(id: number, data: UpdateUserComponentEducationDto): Promise<UserComponentEducation>;
    delete(id: number): Promise<void>;
}
