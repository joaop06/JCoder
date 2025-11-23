import { UsersService } from '../../users/users.service';
import { Application } from '../entities/application.entity';
import { ApplicationsService } from '../applications.service';
import { ReorderApplicationDto } from '../dto/reorder-application.dto';
export declare class ReorderApplicationUseCase {
    private readonly applicationsService;
    private readonly usersService;
    constructor(applicationsService: ApplicationsService, usersService: UsersService);
    execute(username: string, id: number, reorderApplicationDto: ReorderApplicationDto): Promise<Application>;
}
