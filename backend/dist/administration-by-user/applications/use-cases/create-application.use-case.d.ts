import { UsersService } from "../../users/users.service";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { CreateApplicationDto } from "../dto/create-application.dto";
import { ApplicationComponentsService } from "../application-components/application-components.service";
export declare class CreateApplicationUseCase {
    private readonly usersService;
    private readonly applicationsService;
    private readonly applicationComponentsService;
    constructor(usersService: UsersService, applicationsService: ApplicationsService, applicationComponentsService: ApplicationComponentsService);
    execute(username: string, createApplicationDto: CreateApplicationDto): Promise<Application>;
}
