import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from './entities/technology.entity';
import { CacheService } from '../@common/services/cache.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { QueryTechnologyDto } from './dto/query-technology.dto';
import { ImageUploadService } from '../images/services/image-upload.service';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import {
    PaginationDto,
    PaginatedResponseDto,
} from '../@common/dto/pagination.dto';
import { TechnologyNotFoundException } from './exceptions/technology-not-found.exception';

@Injectable()
export class TechnologiesService {
    constructor(
        @InjectRepository(Technology)
        private readonly repository: Repository<Technology>,
        private readonly cacheService: CacheService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    async findAll(
        options?: FindManyOptions<Technology>,
    ): Promise<Technology[]> {
        return await this.repository.find(options);
    }

    async findAllPaginated(
        paginationDto: PaginationDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'displayOrder',
            sortOrder = 'ASC',
        } = paginationDto;
        const skip = (page - 1) * limit;

        const cacheKey = this.cacheService.generateKey(
            'technologies',
            'paginated',
            page,
            limit,
            sortBy,
            sortOrder,
        );

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.repository.findAndCount({
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
    }

    async findAllByQuery(
        queryDto: QueryTechnologyDto,
    ): Promise<PaginatedResponseDto<Technology>> {
        const {
            page = 1,
            isActive,
            limit = 10,
            sortOrder = 'ASC',
            sortBy = 'displayOrder',
        } = queryDto;
        const skip = (page - 1) * limit;

        const cacheKey = this.cacheService.generateKey(
            'technologies',
            'query',
            page,
            limit,
            sortBy,
            sortOrder,
            isActive !== undefined ? String(isActive) : undefined,
        );

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const where: FindOptionsWhere<Technology> = {};
                if (isActive !== undefined) where.isActive = isActive;

                const [data, total] = await this.repository.findAndCount({
                    where,
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
    }

    async findById(id: number): Promise<Technology> {
        const cacheKey = this.cacheService.generateKey('technology', id);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const technology = await this.repository.findOne({
                    where: { id },
                });
                if (!technology) throw new TechnologyNotFoundException();
                return technology;
            },
            600, // 10 minutes cache
        );
    }

    async findOneBy(
        options?: FindOptionsWhere<Technology>,
    ): Promise<Technology | null> {
        return await this.repository.findOneBy(options || {});
    }

    async create(
        createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        const technology = this.repository.create(createTechnologyDto);
        const savedTechnology = await this.repository.save(technology);

        // Invalidate cache
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'paginated'),
        );
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'query'),
        );

        return savedTechnology;
    }

    async update(
        id: number,
        updateTechnologyDto: UpdateTechnologyDto & { displayOrder?: number },
    ): Promise<Technology> {
        const technology = await this.findById(id);
        this.repository.merge(technology, updateTechnologyDto);
        const updatedTechnology = await this.repository.save(technology);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.generateKey('technology', id));
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'paginated'),
        );
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'query'),
        );

        return updatedTechnology;
    }

    async softDelete(id: number): Promise<void> {
        const technology = await this.findById(id);

        // Delete profile image if exists
        if (technology.profileImage) {
            await this.imageUploadService.deleteFile(
                'technologies',
                technology.profileImage,
            );
        }

        await this.repository.softDelete(id);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.generateKey('technology', id));
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'paginated'),
        );
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'query'),
        );
    }

    async restore(id: number): Promise<Technology> {
        await this.repository.restore(id);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.generateKey('technology', id));
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'paginated'),
        );
        await this.cacheService.del(
            this.cacheService.generateKey('technologies', 'query'),
        );

        return await this.findById(id);
    }

    /**
     * Increments displayOrder of all technologies that have displayOrder >= startPosition
     * Used when inserting a new technology at a specific position
     */
    async incrementDisplayOrderFrom(startPosition: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(Technology)
            .set({ displayOrder: () => 'displayOrder + 1' })
            .where('displayOrder >= :startPosition', { startPosition })
            .execute();
    }

    /**
     * Reorders technologies when a technology's displayOrder is updated
     * @param id - ID of the technology being updated
     * @param oldPosition - Current displayOrder position
     * @param newPosition - New displayOrder position
     */
    async reorderOnUpdate(
        id: number,
        oldPosition: number,
        newPosition: number,
    ): Promise<void> {
        if (oldPosition === newPosition) {
            return; // No reordering needed
        }

        if (newPosition < oldPosition) {
            // Moving up: increment displayOrder of technologies between new and old position
            await this.repository
                .createQueryBuilder()
                .update(Technology)
                .set({ displayOrder: () => 'displayOrder + 1' })
                .where('displayOrder >= :newPosition', { newPosition })
                .andWhere('displayOrder < :oldPosition', { oldPosition })
                .andWhere('id != :id', { id })
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
                .execute();
        }
    }

    /**
     * Decrements displayOrder of all technologies that have displayOrder > deletedPosition
     * Used when deleting a technology to adjust the order of remaining technologies
     * @param deletedPosition - The displayOrder of the deleted technology
     */
    async decrementDisplayOrderAfter(deletedPosition: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(Technology)
            .set({ displayOrder: () => 'displayOrder - 1' })
            .where('displayOrder > :deletedPosition', { deletedPosition })
            .execute();
    }
}

