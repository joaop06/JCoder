import { Repository } from "typeorm";
import { CacheService } from "../../@common/services/cache.service";
import { User } from "../../administration-by-user/users/entities/user.entity";
import { GetProfileWithAboutMeDto } from "../dto/get-profile-with-about-me.dto";
export declare class GetProfileWithAboutMeUseCase {
    private readonly cacheService;
    private readonly userRepository;
    constructor(cacheService: CacheService, userRepository: Repository<User>);
    execute(username: string): Promise<GetProfileWithAboutMeDto>;
}
