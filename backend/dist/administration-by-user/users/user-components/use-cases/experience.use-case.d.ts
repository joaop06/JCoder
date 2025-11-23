import { UserComponentsRepository } from '../repositories';
import { UsersService } from '../../../users/users.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentExperienceDto } from '../dto/create-user-component-experience.dto';
import { UpdateUserComponentExperienceDto } from '../dto/update-user-component-experience.dto';
export declare class GetExperiencesUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>>;
}
export declare class CreateExperienceUseCase {
    private readonly usersService;
    private readonly userComponentsRepository;
    constructor(usersService: UsersService, userComponentsRepository: UserComponentsRepository);
    execute(username: string, dto: CreateUserComponentExperienceDto): Promise<UserComponentExperience>;
}
export declare class UpdateExperienceUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number, dto: UpdateUserComponentExperienceDto): Promise<UserComponentExperience>;
}
export declare class DeleteExperienceUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number): Promise<void>;
}
