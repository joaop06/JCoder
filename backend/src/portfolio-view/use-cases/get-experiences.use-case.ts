import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetExperiencesDto } from '../dto/get-experiences.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';
import { UserComponentExperience } from '../../administration-by-user/users/user-components/entities/user-component-experience.entity';

@Injectable()
export class GetExperiencesUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserComponentExperience)
    private readonly experienceRepository: Repository<UserComponentExperience>,
  ) { }

  /**
   * Busca experiências do usuário
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetExperiencesDto> {
    const { page = 1, limit = 10, sortBy = 'companyName', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Validar sortBy - apenas campos válidos da entidade
    const validSortFields = ['id', 'userId', 'companyName'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'companyName';

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'experiences',
      username,
      page,
      limit,
      validatedSortBy,
      sortOrder,
    );

    const result = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new UserNotFoundException();

        const [data, total] = await this.experienceRepository.findAndCount({
          where: { userId: user.id },
          relations: ['positions'],
          skip,
          take: limit,
          order: { [validatedSortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
          },
        };
      },
      300, // 5 minutes cache
    );

    return plainToInstance(GetExperiencesDto, result);
  }
}

