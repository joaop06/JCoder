import { Injectable } from '@nestjs/common';
import { UserComponentsRepository } from '../repositories';
import { ComponentNotFoundException } from '../exceptions/component-not-found.exceptions';

@Injectable()
export class UnlinkCertificateFromEducationUseCase {
    constructor(
        private readonly userComponentsRepository: UserComponentsRepository,
    ) { }

    async execute(username: string, certificateUserId: number, educationUserId: number): Promise<void> {
        // Verify certificate belongs to user
        const certificate = await this.userComponentsRepository.certificateRepository.findOneBy({ id: certificateUserId, user: { username } });
        if (!certificate) {
            throw new ComponentNotFoundException('Certificate');
        }

        // Get current education IDs linked to certificate
        const currentEducationIds = certificate.educations?.map(e => e.id) || [];

        // Remove education ID from links
        const updatedEducationIds = currentEducationIds.filter(id => id !== educationUserId);
        await this.userComponentsRepository.certificateRepository.setEducations(certificate.certificateName, updatedEducationIds);
    }
};
