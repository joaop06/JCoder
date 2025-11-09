import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetEducationsDto } from '../dto/get-educations.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';
import { UserComponentEducation } from '../../administration-by-user/users/user-components/entities/user-component-education.entity';

@Injectable()
export class GetEducationsUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserComponentEducation)
    private readonly educationRepository: Repository<UserComponentEducation>,
  ) { }

  /**
   * Fetches user educations
   * Separate routes for on-demand loading (lazy loading)
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetEducationsDto> {
    const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Validate sortBy - only valid entity fields
    const validSortFields = ['id', 'userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'startDate';

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'educations',
      username,
      page,
      limit,
      validatedSortBy,
      sortOrder,
    );

    const result = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Check if user exists
        const user = await this.userRepository.findOneBy({ username });
        if (!user) throw new UserNotFoundException();

        const [data, total] = await this.educationRepository.findAndCount({
          where: { userId: user.id },
          relations: ['certificates'],
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

    return plainToInstance(GetEducationsDto, result);
  }
};
