import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UsersService } from '../../users.service';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentAboutMe } from '../entities/user-component-about-me.entity';
import { CreateUserComponentAboutMeDto } from '../dto/create-user-component-about-me.dto';
import { UpdateUserComponentAboutMeDto } from '../dto/update-user-component-about-me.dto';
import { UserComponentAboutMeHighlight } from '../entities/user-component-about-me-highlight.entity';
export declare class AboutMeRepository {
    private readonly cacheService;
    private readonly usersService;
    private readonly aboutMeRepository;
    private readonly aboutMeHighlightRepository;
    constructor(cacheService: CacheService, usersService: UsersService, aboutMeRepository: Repository<UserComponentAboutMe>, aboutMeHighlightRepository: Repository<UserComponentAboutMeHighlight>);
    findByUsername(username: string): Promise<UserComponentAboutMe>;
    create(user: User, data: CreateUserComponentAboutMeDto): Promise<UserComponentAboutMe>;
    update(username: string, data: UpdateUserComponentAboutMeDto): Promise<UserComponentAboutMe>;
    createHighlight(aboutMeId: number, data: Partial<UserComponentAboutMeHighlight>): Promise<UserComponentAboutMeHighlight>;
    saveHighlights(aboutMeId: number, highlights: Partial<UserComponentAboutMeHighlight>[]): Promise<UserComponentAboutMeHighlight[]>;
    deleteHighlights(aboutMeId: number): Promise<void>;
}
