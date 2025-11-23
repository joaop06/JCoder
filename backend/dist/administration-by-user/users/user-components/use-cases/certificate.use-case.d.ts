import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentCertificateDto } from '../dto/create-user-component-certificate.dto';
import { UpdateUserComponentCertificateDto } from '../dto/update-user-component-certificate.dto';
export declare class GetCertificatesUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>>;
}
export declare class CreateCertificateUseCase {
    private readonly usersService;
    private readonly userComponentsRepository;
    constructor(usersService: UsersService, userComponentsRepository: UserComponentsRepository);
    execute(username: string, dto: CreateUserComponentCertificateDto): Promise<UserComponentCertificate>;
}
export declare class UpdateCertificateUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number, dto: UpdateUserComponentCertificateDto): Promise<UserComponentCertificate>;
}
export declare class DeleteCertificateUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number): Promise<void>;
}
