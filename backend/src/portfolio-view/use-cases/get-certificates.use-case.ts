import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetCertificatesDto } from '../dto/get-certificates.dto';
import { PaginationDto } from '../../@common/dto/pagination.dto';
import { CacheService } from '../../@common/services/cache.service';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';
import { UserComponentCertificate } from '../../administration-by-user/users/user-components/entities/user-component-certificate.entity';

@Injectable()
export class GetCertificatesUseCase {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserComponentCertificate)
    private readonly certificateRepository: Repository<UserComponentCertificate>,
  ) { }

  /**
   * Fetches user certificates
   */
  async execute(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<GetCertificatesDto> {
    const { page = 1, limit = 10, sortBy = 'issueDate', sortOrder = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Validate sortBy - only valid entity fields
    const validSortFields = ['id', 'userId', 'certificateName', 'registrationNumber', 'verificationUrl', 'issueDate', 'issuedTo', 'profileImage'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'issueDate';

    const cacheKey = this.cacheService.generateKey(
      'portfolio',
      'certificates',
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

        const [data, total] = await this.certificateRepository.findAndCount({
          where: { userId: user.id },
          relations: ['educations'],
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

    return plainToInstance(GetCertificatesDto, result);
  }
};
