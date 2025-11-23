import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
export declare class GetProfileUseCase {
    private readonly usersService;
    constructor(usersService: UsersService);
    execute(username: string, includeComponents?: boolean): Promise<User>;
}
