import { User } from '../../entities/user.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { EducationRepository } from './education.repository';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentCertificateDto } from '../dto/create-user-component-certificate.dto';
import { UpdateUserComponentCertificateDto } from '../dto/update-user-component-certificate.dto';
export declare class CertificateRepository {
    private readonly cacheService;
    private readonly educationRepository;
    private readonly certificateRepository;
    constructor(cacheService: CacheService, educationRepository: EducationRepository, certificateRepository: Repository<UserComponentCertificate>);
    findOneBy(where: FindOptionsWhere<UserComponentCertificate>, includeComponents?: boolean): Promise<UserComponentCertificate>;
    findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>>;
    create(user: User, data: CreateUserComponentCertificateDto): Promise<UserComponentCertificate>;
    update(id: number, data: UpdateUserComponentCertificateDto): Promise<UserComponentCertificate>;
    delete(id: number): Promise<void>;
    setEducations(certificateName: string, educationIds: number[]): Promise<void>;
}
