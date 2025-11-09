import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { EducationRepository } from './education.repository';
import { CacheService } from '../../../../@common/services/cache.service';
import { UserComponentCertificate } from '../entities/user-component-certificate.entity';
import { PaginationDto, PaginatedResponseDto } from '../../../../@common/dto/pagination.dto';
import { CertificateNotFoundException } from '../exceptions/certificate-not-found.exception';
import { CreateUserComponentCertificateDto } from '../dto/create-user-component-certificate.dto';
import { UpdateUserComponentCertificateDto } from '../dto/update-user-component-certificate.dto';

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
        // If relationships are not needed, use repository findOneBy (more efficient)
        if (!includeComponents) {
            const certificate = await this.certificateRepository.findOneBy(where);
            if (!certificate) throw new CertificateNotFoundException();
            return certificate;
        }

        // Otherwise, use QueryBuilder to include relationships
        const queryBuilder = this.certificateRepository.createQueryBuilder('users_components_certificates');

        // Build WHERE conditions dynamically
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

        // Add relationships
        queryBuilder
            .leftJoinAndSelect('users_components_certificates.educations', 'educations');

        const certificate = await queryBuilder.getOne();
        if (!certificate) throw new CertificateNotFoundException();

        return certificate;
    }

    async findAll(username: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        const { page = 1, limit = 10, sortBy = 'issueDate', sortOrder = 'DESC' } = paginationDto;
        const skip = (page - 1) * limit;

        // Validate sortBy - only valid entity fields
        const validSortFields = ['id', 'userId', 'certificateName', 'registrationNumber', 'verificationUrl', 'issueDate', 'issuedTo', 'profileImage'];
        const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'issueDate';

        const cacheKey = this.cacheService.generateKey(
            'certificates',
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
                const [data, total] = await this.certificateRepository.findAndCount({
                    skip,
                    take: limit,
                    relations: ['educations'],
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

    async create(user: User, data: CreateUserComponentCertificateDto): Promise<UserComponentCertificate> {
        // Extract educationIds from data if present
        const { educationIds, educations, ...certificateData } = data;
        
        const certificate = this.certificateRepository.create({
            ...certificateData,
            userId: user.id,
            user,
        });
        const savedCertificate = await this.certificateRepository.save(certificate);
        
        // If educationIds are provided, link them
        if (educationIds && Array.isArray(educationIds) && educationIds.length > 0) {
            await this.setEducations(savedCertificate.certificateName, educationIds);
            // Reload certificate with educations
            return await this.findOneBy({ id: savedCertificate.id }, true);
        }
        
        return savedCertificate;
    }

    async update(id: number, data: UpdateUserComponentCertificateDto): Promise<UserComponentCertificate> {
        // Extract educationIds from data if present
        const { educationIds, educations, ...certificateData } = data;
        
        // Update certificate (excluding educationIds and educations)
        await this.certificateRepository.update({ id }, certificateData);
        
        // If educationIds are provided, update the links
        if (educationIds !== undefined) {
            const certificate = await this.findOneBy({ id });
            if (certificate) {
                await this.setEducations(certificate.certificateName, Array.isArray(educationIds) ? educationIds : []);
            }
        }
        
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
};
