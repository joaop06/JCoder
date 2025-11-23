import { Repository } from 'typeorm';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { CheckEmailAvailabilityDto } from '../dto/check-email-availability.dto';
export declare class CheckEmailAvailabilityUseCase {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    execute(email: string): Promise<CheckEmailAvailabilityDto>;
}
