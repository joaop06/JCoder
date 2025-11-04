import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationRepository } from './education.repository';
import { CacheService } from '../../../@common/services/cache.service';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../@common/dto/pagination.dto';
import { CertificateNotFoundException } from '../exceptions/certificate-not-found.exception';

@Injectable()
export class CertificateRepository {
    constructor(
        private readonly cacheService: CacheService,
        private readonly educationRepository: EducationRepository,

        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
    ) { }

    async findOneBy(
        where: FindOptionsWhere<UserComponentCertificate>,
        includeComponents: boolean = false
    ): Promise<UserComponentCertificate> {
        // Se não precisa de relacionamentos, usar findOneBy do repository (mais eficiente)
        if (!includeComponents) {
            const certificate = await this.certificateRepository.findOneBy(where);
            if (!certificate) throw new CertificateNotFoundException();
            return certificate;
        }

        // Caso contrário, usar QueryBuilder para incluir relacionamentos
        const queryBuilder = this.certificateRepository.createQueryBuilder('users_components_certificates');

        // Construir condições WHERE dinamicamente
        const whereKeys = Object.keys(where) as Array<keyof FindOptionsWhere<UserComponentCertificate>>;
        whereKeys.forEach((key, index) => {
            const paramKey = `param${index}`;
            const value = (where as any)[key];
            if (index === 0) {
                queryBuilder.where(`users_components_certificates.${String(key)} = :${paramKey}`, { [paramKey]: value });
            } else {
                queryBuilder.andWhere(`users_components_certificates.${String(key)} = :${paramKey}`, { [paramKey]: value });
            }
        });

        // Adicionar relacionamentos
        queryBuilder
            .leftJoinAndSelect('users_components_certificates.educations', 'educations');

        const certificate = await queryBuilder.getOne();
        if (!certificate) throw new CertificateNotFoundException();

        return certificate;
    }

    async findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        const { page = 1, limit = 10, sortBy = 'issueDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;

        const cacheKey = this.cacheService.generateKey('certificates', 'paginated', username, page, limit, sortBy, sortOrder);

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const [data, total] = await this.certificateRepository.findAndCount({
                    skip,
                    take: limit,
                    where: { username },
                    relations: ['educations'],
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

    async create(user: User, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        const certificate = this.certificateRepository.create({
            ...data,
            username: user.username,
            user,
        });
        return await this.certificateRepository.save(certificate);
    }

    async update(id: number, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        await this.certificateRepository.update({ id }, data);
        return await this.certificateRepository.findOne({
            where: { id },
            relations: ['educations'],
        });
    }

    async delete(id: number): Promise<void> {
        await this.certificateRepository.delete({ id });
    }

    async setEducations(certificateName: string, educationIds: number[]): Promise<void> {
        const certificate = await this.findOneBy({ certificateName });
        if (!certificate) return;

        const educations = educationIds.length > 0
            ? await this.educationRepository.findAllByIds(educationIds)
            : [];

        certificate.educations = educations;
        await this.certificateRepository.save(certificate);
    }

    async invalidateCache(userId?: number): Promise<void> {
        if (userId) {
            await this.cacheService.del(this.cacheService.generateKey('certificates', 'paginated', userId));
        } else {
            await this.cacheService.del(this.cacheService.generateKey('certificates', 'paginated'));
        }
    }
};
