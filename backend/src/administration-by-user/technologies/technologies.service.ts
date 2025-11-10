import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from './entities/technology.entity';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { CacheService } from '../../@common/services/cache.service';
import { TechnologiesStatsDto } from './dto/technologies-stats.dto';
import { ImageUploadService } from '../images/services/image-upload.service';
import { UsersService } from '../users/users.service';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';

@Injectable()
export class TechnologiesService {
    constructor(
        private readonly cacheService: CacheService,

        private readonly usersService: UsersService,

        @InjectRepository(Technology)
        private readonly repository: Repository<Technology>,

        private readonly imageUploadService: ImageUploadService,
    ) { }

    async findAll(
        username: string,
        paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'displayOrder',
            sortOrder = 'ASC',
            isActive,
        } = paginationDto;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = { user: { username } };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const cacheKey = this.cacheService.generateKey(
            'technologies',
            'paginated',
            username,
            page,
            limit,
            sortBy,
            sortOrder,
            isActive !== undefined ? String(isActive) : 'all',
        );

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.repository.findAndCount({
                    skip,
                    take: limit,
                    where,
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
                        hasPreviousPage: page > 1,
                        hasNextPage: page < totalPages,
                    },
                };
            },
            300, // 5 minutes cache
        );
    }

    async findById(id: number, username: string): Promise<Technology> {
        const cacheKey = this.cacheService.technologyKey(id, 'full', username);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const technology = await this.repository.findOne({
                    where: { id, user: { username } },
                });
                if (!technology) throw new TechnologyNotFoundException();
                return technology;
            },
            600, // 10 minutes cache
        );
    }

    async create(
        createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        const technology = this.repository.create(createTechnologyDto);
        const savedTechnology = await this.repository.save(technology);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));

        return savedTechnology;
    }

    async update(
        id: number,
        updateTechnologyDto: UpdateTechnologyDto & { displayOrder?: number },
    ): Promise<Technology> {
        const technology = await this.repository.findOneBy({ id });

        this.repository.merge(technology, updateTechnologyDto);
        const updatedTechnology = await this.repository.save(technology);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.technologyKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));

        return updatedTechnology;
    }

    async delete(id: number): Promise<void> {
        const technology = await this.repository.findOneBy({ id });

        // Delete profile image if exists
        if (technology.profileImage) {
            await this.imageUploadService.deleteFile(
                'technologies',
                technology.profileImage,
            );
        }

        await this.repository.delete(id);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.technologyKey(id, 'full'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'paginated'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'query'));
        await this.cacheService.del(this.cacheService.generateKey('technologies', 'stats'));
    }

    /**
     * Increments displayOrder of all technologies that have displayOrder >= startPosition
     * Used when inserting a new technology at a specific position
     */
    async incrementDisplayOrderFrom(startPosition: number, userId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(Technology)
            .set({ displayOrder: () => 'displayOrder + 1' })
            .where('displayOrder >= :startPosition', { startPosition })
            .andWhere('userId = :userId', { userId })
            .execute();
    }

    /**
     * Reorders technologies when a technology's displayOrder is updated
     * @param id - ID of the technology being updated
     * @param oldPosition - Current displayOrder position
     * @param newPosition - New displayOrder position
     * @param username - User username to scope the reordering
     */
    async reorderOnUpdate(
        id: number,
        oldPosition: number,
        newPosition: number,
        username: string,
    ): Promise<void> {
        if (oldPosition === newPosition) {
            return; // No reordering needed
        }

        const user = await this.usersService.findOneBy({ username });

        if (newPosition < oldPosition) {
            // Moving up: increment displayOrder of technologies between new and old position
            await this.repository
                .createQueryBuilder()
                .update(Technology)
                .set({ displayOrder: () => 'displayOrder + 1' })
                .where('displayOrder >= :newPosition', { newPosition })
                .andWhere('displayOrder < :oldPosition', { oldPosition })
                .andWhere('id != :id', { id })
                .andWhere('userId = :userId', { userId: user.id })
                .execute();
        } else {
            // Moving down: decrement displayOrder of technologies between old and new position
            await this.repository
                .createQueryBuilder()
                .update(Technology)
                .set({ displayOrder: () => 'displayOrder - 1' })
                .where('displayOrder > :oldPosition', { oldPosition })
                .andWhere('displayOrder <= :newPosition', { newPosition })
                .andWhere('id != :id', { id })
                .andWhere('userId = :userId', { userId: user.id })
                .execute();
        }
    }

    /**
     * Decrements displayOrder of all technologies that have displayOrder > deletedPosition
     * Used when deleting a technology to adjust the order of remaining technologies
     * @param deletedPosition - The displayOrder of the deleted technology
     * @param username - User username to scope the reordering
     */
    async decrementDisplayOrderAfter(deletedPosition: number, username: string): Promise<void> {
        const user = await this.usersService.findOneBy({ username });

        await this.repository
            .createQueryBuilder()
            .update(Technology)
            .set({ displayOrder: () => 'displayOrder - 1' })
            .where('displayOrder > :deletedPosition', { deletedPosition })
            .andWhere('userId = :userId', { userId: user.id })
            .execute();
    }

    /**
     * Get technologies statistics (active and inactive counts)
     */
    async getStats(username: string): Promise<TechnologiesStatsDto> {
        const cacheKey = this.cacheService.generateKey('technologies', 'stats', username);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [total, active, inactive] = await Promise.all([
                    this.repository.count({ where: { user: { username } } }),
                    this.repository.count({ where: { user: { username }, isActive: true } }),
                    this.repository.count({ where: { user: { username }, isActive: false } }),
                ]);

                return { active, inactive, total };
            },
            300, // 5 minutes cache
        );
    }

    async existsByTechnologyNameAndUsername(username: string, name: string): Promise<Technology | null> {
        return await this.repository.findOneBy({ user: { username }, name });
    }
};
