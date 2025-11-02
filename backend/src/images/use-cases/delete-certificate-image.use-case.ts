import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/user-component.exceptions';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Use case for deleting certificate images
 */
@Injectable()
export class DeleteCertificateImageUseCase {
    constructor(
        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(userId: number, certificateId: number): Promise<UserComponentCertificate> {
        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            where: { userId: certificateId },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        // Verify ownership
        if (certificate.userId !== userId) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        if (!certificate.profileImage) {
            return certificate;
        }

        // Delete the image file
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            userId,
            certificate.profileImage,
            'certificates',
        );

        // Remove image reference from certificate
        certificate.profileImage = null;
        return await this.certificateRepository.save(certificate);
    }
}

