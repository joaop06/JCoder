import { UserComponentsRepository } from '../repositories';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';
export declare class GetAboutMeUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string): Promise<UserComponentAboutMe | null>;
}
export declare class UpdateAboutMeUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, dto: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe>;
}
