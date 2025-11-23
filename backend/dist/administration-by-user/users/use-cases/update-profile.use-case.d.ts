import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
import { UpdateProfileDto } from "../dto/update-profile.dto";
export declare class UpdateProfileUseCase {
    private readonly usersService;
    constructor(usersService: UsersService);
    execute(username: string, updateProfileDto: UpdateProfileDto): Promise<User>;
}
