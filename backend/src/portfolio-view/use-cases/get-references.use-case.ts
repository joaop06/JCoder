import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetReferencesDto } from '../dto/get-references.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';
import { UserComponentReference } from '../../administration-by-user/users/user-components/entities/user-component-reference.entity';

@Injectable()
export class GetReferencesUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserComponentReference)
    private readonly referenceRepository: Repository<UserComponentReference>,
  ) { }

  /**
   * Fetches user references
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetReferencesDto> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Validate sortBy - only valid entity fields
    const validSortFields = ['id', 'userId', 'name', 'company', 'email', 'phone'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'references',
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

        const [data, total] = await this.referenceRepository.findAndCount({
          where: { userId: user.id },
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
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      },
      300, // 5 minutes cache
    );

    return plainToInstance(GetReferencesDto, result);
  }
};

