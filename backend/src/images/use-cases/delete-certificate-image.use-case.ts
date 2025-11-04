import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';

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

    async execute(username: string, certificateId: number): Promise<UserComponentCertificate> {
        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            where: { id: certificateId, username },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        // Verify ownership
        if (certificate.username !== username) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        if (!certificate.profileImage) {
            return certificate;
        }

        // Delete the image file
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            certificate.username,
            certificate.profileImage,
            'certificates',
        );

        // Remove image reference from certificate
        certificate.profileImage = null;
        return await this.certificateRepository.save(certificate);
    }
};
