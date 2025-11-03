import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UserComponentsService } from '../user-components.service';
import { ComponentNotFoundException } from '../exceptions/user-component.exceptions';

@Injectable()
export class UnlinkCertificateFromEducationUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly userComponentsService: UserComponentsService,
    ) { }

    async execute(username: string, certificateUserId: number, educationUserId: number): Promise<void> {
        const user = await this.usersService.findByUsername(username);

        // Verify certificate belongs to user
        const certificate = await this.userComponentsService.getCertificate(certificateUserId);
        if (!certificate || certificate.userId !== user.id) {
            throw new ComponentNotFoundException('Certificate');
        }

        // Get current education IDs linked to certificate
        const currentEducationIds = certificate.educations?.map(e => e.userId) || [];

        // Remove education ID from links
        const updatedEducationIds = currentEducationIds.filter(id => id !== educationUserId);
        await this.userComponentsService.linkCertificateToEducation(certificateUserId, updatedEducationIds);
    }
};
