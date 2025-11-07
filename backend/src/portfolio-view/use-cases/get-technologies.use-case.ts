import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetTechnologiesDto } from '../dto/get-technologies.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Technology } from '../../administration-by-user/technologies/entities/technology.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';

@Injectable()
export class GetTechnologiesUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Technology)
    private readonly technologyRepository: Repository<Technology>,
  ) { }

  /**
   * Busca tecnologias do usuário
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetTechnologiesDto> {
    const { page = 1, limit = 50, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'technologies',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new UserNotFoundException();

    const result = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await this.technologyRepository.findAndCount({
          where: { userId: user.id, isActive: true },
          skip,
          take: limit,
          order: { [sortBy]: sortOrder },
        });

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );

    return plainToInstance(GetTechnologiesDto, result);
  }
}

