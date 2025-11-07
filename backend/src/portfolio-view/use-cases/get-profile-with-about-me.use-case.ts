import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CacheService } from "../../@common/services/cache.service";
import { User } from "../../administration-by-user/users/entities/user.entity";
import { GetProfileWithAboutMeDto } from "../dto/get-profile-with-about-me.dto";
import { UserNotFoundException } from "../../administration-by-user/users/exceptions/user-not-found.exception";
import { plainToInstance } from "class-transformer";

@Injectable()
export class GetProfileWithAboutMeUseCase {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Busca dados básicos do perfil do usuário com About Me
     * Otimizado para mobile - apenas dados essenciais sempre visíveis
     */
    async execute(username: string): Promise<GetProfileWithAboutMeDto> {
        const cacheKey = this.cacheService.generateKey('portfolio', 'profile', username);

        const user = await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const user = await this.userRepository.findOne({
                    where: { username },
                    relations: ['userComponentAboutMe', 'userComponentAboutMe.highlights'],
                    select: {
                        username: true,
                        firstName: true,
                        fullName: true,
                        email: true,
                        githubUrl: true,
                        linkedinUrl: true,
                        profileImage: true,
                        createdAt: true,
                        updatedAt: true,
                        userComponentAboutMe: {
                            highlights: true,
                        },
                    },
                });

                if (!user) throw new UserNotFoundException();

                return user;
            },
            600, // 10 minutes cache
        );

        return plainToInstance(GetProfileWithAboutMeDto, user);
    }
};
