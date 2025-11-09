import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentExperience } from '../entities/user-component-experience.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentExperienceDto } from '../dto/create-user-component-experience.dto';
import { UpdateUserComponentExperienceDto } from '../dto/update-user-component-experience.dto';
import { UserComponentExperiencePosition } from '../entities/user-component-experience-position.entity';

@Injectable()
export class ExperienceRepository {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(UserComponentExperience)
        private readonly experienceRepository: Repository<UserComponentExperience>,

        @InjectRepository(UserComponentExperiencePosition)
        private readonly experiencePositionRepository: Repository<UserComponentExperiencePosition>,
    ) { }

    async findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>> {
        const { page = 1, limit = 10, sortBy = 'companyName', sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;

        // Validate sortBy - only valid entity fields
        const validSortFields = ['id', 'userId', 'companyName'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'companyName';

        const cacheKey = this.cacheService.generateKey('experiences', 'paginated', username, page, limit, validatedSortBy, sortOrder);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.experienceRepository.findAndCount({
                    skip,
                    take: limit,
                    relations: ['positions'],
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

    async create(user: User, data: CreateUserComponentExperienceDto): Promise<UserComponentExperience> {
        const experience = this.experienceRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.experienceRepository.save(experience);
    }

    async update(id: number, data: UpdateUserComponentExperienceDto): Promise<UserComponentExperience> {
        // Extract positions from data if present
        const { positions, ...experienceData } = data;
        
        // Update experience (excluding positions)
        await this.experienceRepository.update({ id }, experienceData);
        
        // If positions are provided, save them
        if (positions && Array.isArray(positions)) {
            await this.savePositions(id, positions);
        }
        
        return await this.experienceRepository.findOne({
            where: { id },
            relations: ['positions'],
        });
    }

    async delete(id: number): Promise<void> {
        await this.experienceRepository.delete({ id });
    }

    async createPosition(experienceId: number, data: Partial<UserComponentExperiencePosition>): Promise<UserComponentExperiencePosition> {
        const position = this.experiencePositionRepository.create({
            ...data,
            experienceId,
        });
        return await this.experiencePositionRepository.save(position);
    }

    async savePositions(experienceId: number, positions: Partial<UserComponentExperiencePosition>[]): Promise<UserComponentExperiencePosition[]> {
        // Delete existing positions
        await this.deletePositions({ experienceId });

        // Create new positions
        const savedPositions = [];
        for (const position of positions) {
            const saved = await this.createPosition(experienceId, position);
            savedPositions.push(saved);
        }
        return savedPositions;
    }

    async deletePositions(where: FindOptionsWhere<UserComponentExperiencePosition>): Promise<void> {
        await this.experiencePositionRepository.delete(where);
    }
};
