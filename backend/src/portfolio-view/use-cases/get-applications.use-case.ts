import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetApplicationsDto } from '../dto/get-applications.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';

@Injectable()
export class GetApplicationsUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) { }

  /**
   * Fetches all user applications (without components)
   * Optimized for fast listing
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetApplicationsDto> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'applications',
      username,
      page,
      limit,
      sortBy,
      sortOrder,
    );

    const result = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new UserNotFoundException();

        const [data, total] = await this.applicationRepository.findAndCount({
          where: { userId: user.id, isActive: true },
          relations: ['technologies'],
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

    return plainToInstance(GetApplicationsDto, result);
  }
}

