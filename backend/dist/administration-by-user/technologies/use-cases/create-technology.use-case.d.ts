import { UsersService } from '../../users/users.service';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { CreateTechnologyDto } from '../dto/create-technology.dto';
export declare class CreateTechnologyUseCase {
    private readonly usersService;
    private readonly technologiesService;
    constructor(usersService: UsersService, technologiesService: TechnologiesService);
    execute(username: string, createTechnologyDto: CreateTechnologyDto): Promise<Technology>;
    private existsTechnologyName;
}
