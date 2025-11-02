import {
    ComponentNotFoundException,
    InvalidEducationDatesException,
    InvalidExperiencePositionDatesException,
} from './exceptions/user-component.exceptions';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserComponentsRepository } from './user-components.repository';
import { UserComponentAboutMeDto } from './dto/user-component-about-me.dto';
import { UserComponentEducationDto } from './dto/user-component-education.dto';
import { UserComponentExperienceDto } from './dto/user-component-experience.dto';
import { UserComponentCertificateDto } from './dto/user-component-certificate.dto';
import { UserComponentEducation } from './entities/user-component-education.entity';
import { UserComponentExperience } from './entities/user-component-experience.entity';
import { UserComponentCertificate } from './entities/user-component-certificate.entity';
import { UpdateUserComponentAboutMeDto } from './dto/update-user-component-about-me.dto';
import { UpdateUserComponentEducationDto } from './dto/update-user-component-education.dto';
import { UpdateUserComponentExperienceDto } from './dto/update-user-component-experience.dto';
import { UpdateUserComponentCertificateDto } from './dto/update-user-component-certificate.dto';

@Injectable()
export class UserComponentsService {
    constructor(
        private readonly repository: UserComponentsRepository,
    ) { }

    // About Me
    async createOrUpdateAboutMe(user: User, dto: UserComponentAboutMeDto) {
        const existing = await this.repository.findAboutMeByUserId(user.id);

        if (existing) {
            // Update existing
            await this.repository.updateAboutMe(user.id, {
                occupation: dto.occupation,
                description: dto.description,
            });

            // Update highlights
            if (dto.highlights) {
                await this.repository.saveAboutMeHighlights(user.id, dto.highlights);
            }

            return await this.repository.findAboutMeByUserId(user.id);
        } else {
            // Create new
            const aboutMe = await this.repository.createAboutMe(user, {
                occupation: dto.occupation,
                description: dto.description,
            });

            // Create highlights
            if (dto.highlights && dto.highlights.length > 0) {
                await this.repository.saveAboutMeHighlights(aboutMe.userId, dto.highlights);
            }

            return await this.repository.findAboutMeByUserId(user.id);
        }
    }

    async updateAboutMe(userId: number, dto: UpdateUserComponentAboutMeDto) {
        const existing = await this.repository.findAboutMeByUserId(userId);
        if (!existing) {
            throw new ComponentNotFoundException('About Me');
        }

        await this.repository.updateAboutMe(userId, {
            occupation: dto.occupation,
            description: dto.description,
        });

        if (dto.highlights) {
            await this.repository.saveAboutMeHighlights(userId, dto.highlights);
        }

        return await this.repository.findAboutMeByUserId(userId);
    }

    async getAboutMe(userId: number) {
        return await this.repository.findAboutMeByUserId(userId);
    }

    // Education
    async createEducation(user: User, dto: UserComponentEducationDto) {
        this.validateEducationDates(dto);
        return await this.repository.createEducation(user, dto);
    }

    async updateEducation(id: number, dto: UpdateUserComponentEducationDto) {
        this.validateEducationDates(dto as UserComponentEducationDto);
        return await this.repository.updateEducation(id, dto);
    }

    async getEducation(id: number) {
        return await this.repository.findEducationById(id);
    }

    async getEducations(userId: number) {
        return await this.repository.findEducationsByUserId(userId);
    }

    async deleteEducation(id: number) {
        await this.repository.deleteEducation(id);
    }

    // Experience
    async createExperience(user: User, dto: UserComponentExperienceDto) {
        const experience = await this.repository.createExperience(user, {
            companyName: dto.companyName,
        });

        if (dto.positions && dto.positions.length > 0) {
            this.validateExperiencePositions(dto.positions);
            await this.repository.saveExperiencePositions(experience.userId, dto.positions);
        }

        return await this.repository.findExperienceById(experience.userId);
    }

    async updateExperience(id: number, dto: UpdateUserComponentExperienceDto) {
        await this.repository.updateExperience(id, {
            companyName: dto.companyName,
        });

        if (dto.positions) {
            this.validateExperiencePositions(dto.positions);
            await this.repository.saveExperiencePositions(id, dto.positions);
        }

        return await this.repository.findExperienceById(id);
    }

    async getExperience(id: number) {
        return await this.repository.findExperienceById(id);
    }

    async getExperiences(userId: number) {
        return await this.repository.findExperiencesByUserId(userId);
    }

    async deleteExperience(id: number) {
        await this.repository.deleteExperience(id);
    }

    // Certificate
    async createCertificate(user: User, dto: UserComponentCertificateDto) {
        const certificate = await this.repository.createCertificate(user, {
            issuedTo: dto.issuedTo,
            issueDate: dto.issueDate,
            profileImage: dto.profileImage,
            certificateName: dto.certificateName,
            verificationUrl: dto.verificationUrl,
            registrationNumber: dto.registrationNumber,
        });

        if (dto.educationIds && dto.educationIds.length > 0) {
            await this.repository.setCertificateEducations(certificate.userId, dto.educationIds);
        }

        return await this.repository.findCertificateById(certificate.userId);
    }

    async updateCertificate(id: number, dto: UpdateUserComponentCertificateDto) {
        await this.repository.updateCertificate(id, {
            issuedTo: dto.issuedTo,
            issueDate: dto.issueDate,
            profileImage: dto.profileImage,
            certificateName: dto.certificateName,
            verificationUrl: dto.verificationUrl,
            registrationNumber: dto.registrationNumber,
        });

        if (dto.educationIds !== undefined) {
            await this.repository.setCertificateEducations(id, dto.educationIds || []);
        }

        return await this.repository.findCertificateById(id);
    }

    async getCertificate(id: number) {
        return await this.repository.findCertificateById(id);
    }

    async getCertificates(userId: number) {
        return await this.repository.findCertificatesByUserId(userId);
    }

    async deleteCertificate(id: number) {
        await this.repository.deleteCertificate(id);
    }

    async linkCertificateToEducation(certificateId: number, educationIds: number[]) {
        await this.repository.setCertificateEducations(certificateId, educationIds);
    }

    // Validation helpers
    private validateEducationDates(dto: UserComponentEducationDto): void {
        if (dto.isCurrentlyStudying) {
            if (dto.endDate && dto.endDate <= new Date()) {
                throw new InvalidEducationDatesException('If currently studying, end date must be in the future or null');
            }
        } else {
            if (!dto.endDate) {
                throw new InvalidEducationDatesException('End date is required when not currently studying');
            }
            if (dto.endDate < dto.startDate) {
                throw new InvalidEducationDatesException('End date must be after start date');
            }
        }
    }

    private validateExperiencePositions(positions: any[]): void {
        for (const position of positions) {
            if (position.isCurrentPosition) {
                if (position.endDate) {
                    throw new InvalidExperiencePositionDatesException('Current position cannot have an end date');
                }
            } else {
                if (!position.endDate) {
                    throw new InvalidExperiencePositionDatesException('End date is required for non-current positions');
                }
                if (position.endDate < position.startDate) {
                    throw new InvalidExperiencePositionDatesException('End date must be after start date');
                }
            }
        }
    }

};
