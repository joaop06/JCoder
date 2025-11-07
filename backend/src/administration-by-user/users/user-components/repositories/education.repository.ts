import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentEducation } from '../entities/user-component-education.entity';
import { EducationNotFoundException } from '../exceptions/education-not-found.exception';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CreateUserComponentEducationDto } from '../dto/create-user-component-education.dto';
import { UpdateUserComponentEducationDto } from '../dto/update-user-component-education.dto';

@Injectable()
export class EducationRepository {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(UserComponentEducation)
        private readonly educationRepository: Repository<UserComponentEducation>,
    ) { }

    async findAllByIds(ids: number[]): Promise<UserComponentEducation[]> {
        return await this.educationRepository.find({
            where: { id: In(ids) },
        });
    }

    async findOneBy(
        where: FindOptionsWhere<UserComponentEducation>,
        includeComponents: boolean = false
    ): Promise<UserComponentEducation> {
        // Se não precisa de relacionamentos, usar findOneBy do repository (mais eficiente)
        if (!includeComponents) {
            const education = await this.educationRepository.findOneBy(where);
            if (!education) throw new EducationNotFoundException();
            return education;
        }

        // Caso contrário, usar QueryBuilder para incluir relacionamentos
        const queryBuilder = this.educationRepository.createQueryBuilder('users_components_educations');

        // Construir condições WHERE dinamicamente
        const whereKeys = Object.keys(where) as Array<keyof FindOptionsWhere<UserComponentEducation>>;
        whereKeys.forEach((key, index) => {
            const paramKey = `param${index}`;
            const value = (where as any)[key];
            if (index === 0) {
                queryBuilder.where(`users_components_educations.${String(key)} = :${paramKey}`, { [paramKey]: value });
            } else {
                queryBuilder.andWhere(`users_components_educations.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
        });

        // Adicionar relacionamentos
        queryBuilder
            .leftJoinAndSelect('users_components_educations.certificates', 'certificates');

        const education = await queryBuilder.getOne();
        if (!education) throw new EducationNotFoundException();

        return education;
    }

    async findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>> {
        const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;

        // Validar sortBy - apenas campos válidos da entidade
        const validSortFields = ['id', 'userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'startDate';

        const cacheKey = this.cacheService.generateKey('educations', 'paginated', username, page, limit, validatedSortBy, sortOrder);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.educationRepository.findAndCount({
                    skip,
                    take: limit,
                    relations: ['certificates'],
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

    async create(user: User, data: CreateUserComponentEducationDto): Promise<UserComponentEducation> {
        const education = this.educationRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.educationRepository.save(education);
    }

    async update(id: number, data: UpdateUserComponentEducationDto): Promise<UserComponentEducation> {
        await this.educationRepository.update({ id }, data);
        return await this.educationRepository.findOne({
            where: { id },
            relations: ['certificates'],
        });
    }

    async delete(id: number): Promise<void> {
        await this.educationRepository.delete({ id });
    }
};
