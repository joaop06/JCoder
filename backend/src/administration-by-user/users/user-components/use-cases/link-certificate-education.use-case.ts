import { Injectable } from '@nestjs/common';
import { UserComponentsRepository } from '../repositories';
import { ComponentNotFoundException } from '../exceptions/component-not-found.exceptions';

@Injectable()
export class LinkCertificateToEducationUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, certificateUserId: number, educationUserId: number): Promise<void> {
        // Verify certificate belongs to user
        const certificate = await this.userComponentsRepository.certificateRepository.findOneBy({ id: certificateUserId, user: { username } });
        if (!certificate) {
            throw new ComponentNotFoundException('Certificate');
        }

        // Verify education belongs to user
        const education = await this.userComponentsRepository.educationRepository.findOneBy({ id: educationUserId, user: { username } });
        if (!education) {
            throw new ComponentNotFoundException('Education');
        }

        // Get current education IDs linked to certificate
        const currentEducationIds = certificate.educations?.map(e => e.id) || [];

        // Add new education ID if not already linked
        if (!currentEducationIds.includes(educationUserId)) {
            await this.userComponentsRepository.certificateRepository.setEducations(certificate.certificateName, [...currentEducationIds, educationUserId]);
        }
    }
};
