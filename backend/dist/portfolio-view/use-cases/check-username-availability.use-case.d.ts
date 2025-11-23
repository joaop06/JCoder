import { Repository } from 'typeorm';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { CheckUsernameAvailabilityDto } from '../dto/check-username-availability.dto';
export declare class CheckUsernameAvailabilityUseCase {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    execute(username: string): Promise<CheckUsernameAvailabilityDto>;
}
