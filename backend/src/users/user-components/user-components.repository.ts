import { Repository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentAboutMe } from './entities/user-component-about-me.entity';
import { UserComponentEducation } from './entities/user-component-education.entity';
import { UserComponentExperience } from './entities/user-component-experience.entity';
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

    async deleteAboutMeHighlights(userId: number): Promise<void> {
        await this.aboutMeHighlightRepository.delete({ userId });
    }

    async createAboutMeHighlight(userId: number, data: Partial<UserComponentAboutMeHighlight>): Promise<UserComponentAboutMeHighlight> {
        const highlight = this.aboutMeHighlightRepository.create({
            ...data,
            userId,
        });
        return await this.aboutMeHighlightRepository.save(highlight);
    }

    async saveAboutMeHighlights(userId: number, highlights: Partial<UserComponentAboutMeHighlight>[]): Promise<UserComponentAboutMeHighlight[]> {
        // Delete existing highlights
        await this.deleteAboutMeHighlights(userId);

        // Create new highlights
        const savedHighlights = [];
        for (const highlight of highlights) {
            const saved = await this.createAboutMeHighlight(userId, highlight);
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

    async updateEducation(id: number, data: Partial<UserComponentEducation>): Promise<UserComponentEducation> {
        await this.educationRepository.update({ id }, data);
        return await this.educationRepository.findOne({ where: { id } });
    }

    async findEducationById(id: number): Promise<UserComponentEducation | null> {
        return await this.educationRepository.findOne({
            where: { id },
            relations: ['certificates'],
        });
    }

    async findEducationsByUserId(userId: number): Promise<UserComponentEducation[]> {
        return await this.educationRepository.find({
            where: { userId },
            relations: ['certificates'],
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

    async updateExperience(id: number, data: Partial<UserComponentExperience>): Promise<UserComponentExperience> {
        await this.experienceRepository.update({ id }, data);
        return await this.experienceRepository.findOne({ where: { id } });
    }

    async findExperienceById(id: number): Promise<UserComponentExperience | null> {
        return await this.experienceRepository.findOne({
            where: { id },
            relations: ['positions'],
        });
    }

    async findExperiencesByUserId(userId: number): Promise<UserComponentExperience[]> {
        return await this.experienceRepository.find({
            where: { userId },
            relations: ['positions'],
        });
    }

    async deleteExperience(id: number): Promise<void> {
        await this.experienceRepository.delete(id);
    }

    async deleteExperiencePositions(experienceId: number): Promise<void> {
        await this.experiencePositionRepository.delete({ experienceId });
    }

    async createExperiencePosition(experienceId: number, data: Partial<UserComponentExperiencePosition>): Promise<UserComponentExperiencePosition> {
        const position = this.experiencePositionRepository.create({
            ...data,
            experienceId,
        });
        return await this.experiencePositionRepository.save(position);
    }

    async saveExperiencePositions(experienceId: number, positions: Partial<UserComponentExperiencePosition>[]): Promise<UserComponentExperiencePosition[]> {
        // Delete existing positions
        await this.deleteExperiencePositions(experienceId);

        // Create new positions
        const savedPositions = [];
        for (const position of positions) {
            const saved = await this.createExperiencePosition(experienceId, position);
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

    async updateCertificate(id: number, data: Partial<UserComponentCertificate>): Promise<UserComponentCertificate> {
        await this.certificateRepository.update({ id }, data);
        return await this.certificateRepository.findOne({ where: { id } });
    }

    async findCertificateById(id: number): Promise<UserComponentCertificate | null> {
        return await this.certificateRepository.findOne({
            where: { id },
            relations: ['educations'],
        });
    }

    async findCertificatesByUserId(userId: number): Promise<UserComponentCertificate[]> {
        return await this.certificateRepository.find({
            where: { userId },
            relations: ['educations'],
        });
    }

    async deleteCertificate(id: number): Promise<void> {
        await this.certificateRepository.delete(id);
    }

    async setCertificateEducations(certificateId: number, educationIds: number[]): Promise<void> {
        const certificate = await this.findCertificateById(certificateId);
        if (!certificate) return;

        const educations = educationIds.length > 0
            ? await this.educationRepository.find({ where: { id: In(educationIds) } })
            : [];

        certificate.educations = educations;
        await this.certificateRepository.save(certificate);
    }
};
