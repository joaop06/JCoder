import { UsersService } from '../../users.service';
import { UserComponentsRepository } from '../repositories';
import { UserComponentReference } from '../entities/user-component-reference.entity';
import { PaginatedResponseDto, PaginationDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentReferenceDto } from '../dto/create-user-component-reference.dto';
import { UpdateUserComponentReferenceDto } from '../dto/update-user-component-reference.dto';
export declare class GetReferencesUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentReference>>;
}
export declare class CreateReferenceUseCase {
    private readonly usersService;
    private readonly userComponentsRepository;
    constructor(usersService: UsersService, userComponentsRepository: UserComponentsRepository);
    execute(username: string, dto: CreateUserComponentReferenceDto): Promise<UserComponentReference>;
}
export declare class UpdateReferenceUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number, dto: UpdateUserComponentReferenceDto): Promise<UserComponentReference>;
}
export declare class DeleteReferenceUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(id: number): Promise<void>;
}
