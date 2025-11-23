import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailVerification } from '../entities/email-verification.entity';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UsersService } from '../../administration-by-user/users/users.service';
import { UserComponentAboutMe } from '../../administration-by-user/users/user-components/entities/user-component-about-me.entity';
export declare class CreateUserUseCase {
    private readonly usersService;
    private readonly userRepository;
    private readonly aboutMeRepository;
    private readonly emailVerificationRepository;
    constructor(usersService: UsersService, userRepository: Repository<User>, aboutMeRepository: Repository<UserComponentAboutMe>, emailVerificationRepository: Repository<EmailVerification>);
    execute(createUserDto: CreateUserDto): Promise<User>;
}
