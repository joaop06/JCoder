import { Repository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentAboutMe } from './entities/user-component-about-me.entity';
import { UserComponentEducation } from './entities/user-component-education.entity';
import { UserComponentExperience } from './entities/user-component-experience.entity';
import { PaginationDto, PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentCertificate } from './entities/user-component-certificate.entity';
import { UserComponentAboutMeHighlight } from './entities/user-component-about-me-highlight.entity';
import { UserComponentExperiencePosition } from './entities/user-component-experience-position.entity';

@Injectable()
export class UserComponentsRepository {
    constructor(
        @InjectRepository(UserComponentAboutMe)
        private readonly aboutMeRepository: Repository<UserComponentAboutMe>,

        @InjectRepository(UserComponentEducation)
        private readonly educationRepository: Repository<UserComponentEducation>,

        @InjectRepository(UserComponentExperience)
        private readonly experienceRepository: Repository<UserComponentExperience>,

        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,

        @InjectRepository(UserComponentAboutMeHighlight)
        private readonly aboutMeHighlightRepository: Repository<UserComponentAboutMeHighlight>,

        @InjectRepository(UserComponentExperiencePosition)
        private readonly experiencePositionRepository: Repository<UserComponentExperiencePosition>,
    ) { }

    /**
     * About Me
     */
    async createAboutMe(user: User, data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        const aboutMe = this.aboutMeRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.aboutMeRepository.save(aboutMe);
    }

    async updateAboutMe(userId: number, data: Partial<UserComponentAboutMe>): Promise<UserComponentAboutMe> {
        await this.aboutMeRepository.update({ userId }, data);
        return await this.aboutMeRepository.findOne({ where: { userId } });
    }

    async findAboutMeByUserId(userId: number): Promise<UserComponentAboutMe | null> {
        return await this.aboutMeRepository.findOne({
            where: { userId },
            relations: ['highlights'],
        });
    }

    async deleteAboutMeHighlights(aboutMeId: number): Promise<void> {
        await this.aboutMeHighlightRepository.delete({ aboutMeId });
    }

    async createAboutMeHighlight(aboutMeId: number, data: Partial<UserComponentAboutMeHighlight>): Promise<UserComponentAboutMeHighlight> {
        const highlight = this.aboutMeHighlightRepository.create({
            ...data,
            aboutMeId,
        });
        return await this.aboutMeHighlightRepository.save(highlight);
    }

    async saveAboutMeHighlights(userId: number, highlights: Partial<UserComponentAboutMeHighlight>[]): Promise<UserComponentAboutMeHighlight[]> {
        // Find the about me record to get the aboutMeId
        const aboutMe = await this.findAboutMeByUserId(userId);
        if (!aboutMe) {
            throw new Error('About Me record not found');
        }

        // Delete existing highlights
        await this.deleteAboutMeHighlights(aboutMe.userId);

        // Create new highlights
        const savedHighlights = [];
        for (const highlight of highlights) {
            const saved = await this.createAboutMeHighlight(aboutMe.userId, highlight);
            savedHighlights.push(saved);
        }
        return savedHighlights;
    }

    /**
     * Education
     */
    async createEducation(user: User, data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        const education = this.educationRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.educationRepository.save(education);
    }

    async updateEducation(userId: number, data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        await this.educationRepository.update({ userId }, data);
        return await this.educationRepository.findOne({ where: { userId } });
    }

    async findEducationById(userId: number): Promise<UserComponentEducation | null> {
        return await this.educationRepository.findOne({
            where: { userId },
            relations: ['certificates'],
        });
    }

    async findEducationsByUserId(userId: number): Promise<UserComponentEducation[]> {
        return await this.educationRepository.find({
            where: { userId },
            relations: ['certificates'],
            select: ['userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying']
        });
    }

    async deleteEducation(id: number): Promise<void> {
        await this.educationRepository.delete(id);
    }

    /**
     * Experience
     */
    async createExperience(user: User, data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        const experience = this.experienceRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.experienceRepository.save(experience);
    }

    async updateExperience(userId: number, data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        await this.experienceRepository.update({ userId }, data);
        return await this.experienceRepository.findOne({ where: { userId } });
    }

    async findExperienceById(userId: number): Promise<UserComponentExperience | null> {
        return await this.experienceRepository.findOne({
            where: { userId },
            relations: ['positions'],
        });
    }

    async findExperiencesByUserId(userId: number): Promise<UserComponentExperience[]> {
        return await this.experienceRepository.find({
            where: { userId },
            relations: ['positions'],
            select: ['userId', 'companyName']
        });
    }

    async deleteExperience(id: number): Promise<void> {
        await this.experienceRepository.delete(id);
    }

    async deleteExperiencePositions(userId: number): Promise<void> {
        // Find the experience record to get the experienceId
        const experience = await this.findExperienceById(userId);
        if (!experience) {
            throw new Error('Experience record not found');
        }
        await this.experiencePositionRepository.delete({ experienceId: experience.userId });
    }

    async createExperiencePosition(userId: number, data: Partial<UserComponentExperiencePosition>): Promise<UserComponentExperiencePosition> {
        // Find the experience record to get the experienceId
        const experience = await this.findExperienceById(userId);
        if (!experience) {
            throw new Error('Experience record not found');
        }

        const position = this.experiencePositionRepository.create({
            ...data,
            experienceId: experience.userId,
        });
        return await this.experiencePositionRepository.save(position);
    }

    async saveExperiencePositions(userId: number, positions: Partial<UserComponentExperiencePosition>[]): Promise<UserComponentExperiencePosition[]> {
        // Find the experience record to get the experienceId
        const experience = await this.findExperienceById(userId);
        if (!experience) {
            throw new Error('Experience record not found');
        }

        // Delete existing positions
        await this.deleteExperiencePositions(experience.userId);

        // Create new positions
        const savedPositions = [];
        for (const position of positions) {
            const saved = await this.createExperiencePosition(experience.userId, position);
            savedPositions.push(saved);
        }
        return savedPositions;
    }

    /**
     * Certificate
     */
    async createCertificate(user: User, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        const certificate = this.certificateRepository.create({
            ...data,
            userId: user.id,
            user,
        });
        return await this.certificateRepository.save(certificate);
    }

    async updateCertificate(userId: number, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        await this.certificateRepository.update({ userId }, data);
        return await this.certificateRepository.findOne({ where: { userId } });
    }

    async findCertificateById(userId: number): Promise<UserComponentCertificate | null> {
        return await this.certificateRepository.findOne({
            where: { userId },
            relations: ['educations'],
        });
    }

    async findCertificatesByUserId(userId: number): Promise<UserComponentCertificate[]> {
        return await this.certificateRepository.find({
            where: { userId },
            relations: ['educations'],
            select: ['userId', 'certificateName', 'issuedTo', 'issueDate', 'verificationUrl', 'registrationNumber', 'profileImage']
        });
    }

    async deleteCertificate(id: number): Promise<void> {
        await this.certificateRepository.delete(id);
    }

    async setCertificateEducations(certificateId: number, educationIds: number[]): Promise<void> {
        const certificate = await this.findCertificateById(certificateId);
        if (!certificate) return;

        const educations = educationIds.length > 0
            ? await this.educationRepository.find({ where: { userId: In(educationIds) } })
            : [];

        certificate.educations = educations;
        await this.certificateRepository.save(certificate);
    }

    /**
     * Paginated methods
     */
    async findEducationsByUserIdPaginated(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentEducation>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.educationRepository.findAndCount({
            where: { userId },
            relations: ['certificates'],
            select: ['userId', 'institutionName', 'courseName', 'degree', 'startDate', 'endDate', 'isCurrentlyStudying'],
            skip,
            take: limit,
            order: { startDate: 'DESC' }
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    async findExperiencesByUserIdPaginated(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentExperience>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.experienceRepository.findAndCount({
            where: { userId },
            relations: ['positions'],
            select: ['userId', 'companyName'],
            skip,
            take: limit,
            order: { companyName: 'ASC' }
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    async findCertificatesByUserIdPaginated(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserComponentCertificate>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.certificateRepository.findAndCount({
            where: { userId },
            relations: ['educations'],
            select: ['userId', 'certificateName', 'issuedTo', 'issueDate', 'verificationUrl', 'registrationNumber', 'profileImage'],
            skip,
            take: limit,
            order: { issueDate: 'DESC' }
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }
};
