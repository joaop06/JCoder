import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { CreateUserComponentEducationDto } from '../dto/create-user-component-education.dto';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { UpdateUserComponentEducationDto } from '../dto/update-user-component-education.dto';
export declare class GetEducationsUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>>;
}
export declare class CreateEducationUseCase {
    private readonly usersService;
    private readonly userComponentsRepository;
    constructor(usersService: UsersService, userComponentsRepository: UserComponentsRepository);
    execute(username: string, dto: CreateUserComponentEducationDto): Promise<UserComponentEducation>;
}
export declare class UpdateEducationUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number, dto: UpdateUserComponentEducationDto): Promise<UserComponentEducation>;
}
export declare class DeleteEducationUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number): Promise<void>;
}
