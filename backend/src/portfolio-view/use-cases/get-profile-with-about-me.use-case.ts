import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { CacheService } from "../../@common/services/cache.service";
import { User } from "../../administration-by-user/users/entities/user.entity";
import { GetProfileWithAboutMeDto } from "../dto/get-profile-with-about-me.dto";
import { UserNotFoundException } from "../../administration-by-user/users/exceptions/user-not-found.exception";

@Injectable()
export class GetProfileWithAboutMeUseCase {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Fetches basic user profile data with About Me
     * Optimized for mobile - only essential data always visible
     */
    async execute(username: string): Promise<GetProfileWithAboutMeDto> {
        const cacheKey = this.cacheService.generateKey('portfolio', 'profile', username);

        const user = await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const user = await this.userRepository
                    .createQueryBuilder('user')
                    .where('user.username = :username', { username })
                    .leftJoinAndSelect('user.userComponentAboutMe', 'aboutMe')
                    .leftJoinAndSelect('aboutMe.highlights', 'highlights')
                    .select([
                        'user.id',
                        'user.username',
                        'user.firstName',
                        'user.fullName',
                        'user.email',
                        'user.githubUrl',
                        'user.linkedinUrl',
                        'user.profileImage',
                        'user.createdAt',
                        'user.updatedAt',
                        'aboutMe.id',
                        'aboutMe.userId',
                        'aboutMe.occupation',
                        'aboutMe.description',
                        'highlights.id',
                        'highlights.aboutMeId',
                        'highlights.title',
                        'highlights.subtitle',
                        'highlights.emoji',
                    ])
                    .getOne();

                if (!user) throw new UserNotFoundException();

                return user;
            },
            600, // 10 minutes cache
        );

        return plainToInstance(GetProfileWithAboutMeDto, user);
    }
};
