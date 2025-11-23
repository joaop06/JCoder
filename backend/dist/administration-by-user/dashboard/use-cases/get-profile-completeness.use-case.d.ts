import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { CacheService } from '../../../@common/services/cache.service';
import { ProfileCompletenessDto } from '../dto/dashboard-response.dto';
import { UserComponentAboutMe } from '../../users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../../users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../../users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { UserComponentReference } from '../../users/user-components/entities/user-component-reference.entity';
export declare class GetProfileCompletenessUseCase {
    private readonly usersService;
    private readonly cacheService;
    private readonly aboutMeRepository;
    private readonly educationRepository;
    private readonly experienceRepository;
    private readonly certificateRepository;
    private readonly referenceRepository;
    constructor(usersService: UsersService, cacheService: CacheService, aboutMeRepository: Repository<UserComponentAboutMe>, educationRepository: Repository<UserComponentEducation>, experienceRepository: Repository<UserComponentExperience>, certificateRepository: Repository<UserComponentCertificate>, referenceRepository: Repository<UserComponentReference>);
    execute(username: string): Promise<ProfileCompletenessDto>;
    private getEmptyCompleteness;
}
