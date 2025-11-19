import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentReference } from '../entities/user-component-reference.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { ReferenceNotFoundException } from '../exceptions/reference-not-found.exception';
import { CreateUserComponentReferenceDto } from '../dto/create-user-component-reference.dto';
import { UpdateUserComponentReferenceDto } from '../dto/update-user-component-reference.dto';

@Injectable()
export class ReferenceRepository {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(UserComponentReference)
        private readonly referenceRepository: Repository<UserComponentReference>,
    ) { }

    async findOneBy(
        where: FindOptionsWhere<UserComponentReference>,
    ): Promise<UserComponentReference> {
        const reference = await this.referenceRepository.findOneBy(where);
        if (!reference) throw new ReferenceNotFoundException();
        return reference;
    }

    async findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentReference>> {
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;

        // Validate sortBy - only valid entity fields
        const validSortFields = ['id', 'userId', 'name', 'company', 'email', 'phone'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

        const cacheKey = this.cacheService.generateKey(
            'references',
            'paginated',
            username,
            page,
            limit,
            validatedSortBy,
            sortOrder,
        );

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.referenceRepository.findAndCount({
                    skip,
                    take: limit,
                    where: { user: { username } },
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
    }

    async create(user: User, data: CreateUserComponentReferenceDto): Promise<UserComponentReference> {
        const reference = this.referenceRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.referenceRepository.save(reference);
    }

    async update(id: number, data: UpdateUserComponentReferenceDto): Promise<UserComponentReference> {
        await this.referenceRepository.update({ id }, data);
        return await this.findOneBy({ id });
    }

    async delete(id: number): Promise<void> {
        await this.referenceRepository.delete({ id });
    }
};

