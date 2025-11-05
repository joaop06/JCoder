import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
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
        private readonly usersService: UsersService,

        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
    ) { }

    async execute(username: string, certificateId: number): Promise<UserComponentCertificate> {
        // Find the user
        const user = await this.usersService.findOneBy({ username });

        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            where: { id: certificateId, userId: user.id },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        // Verify ownership
        if (certificate.userId !== user.id) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        if (!certificate.profileImage) {
            return certificate;
        }

        // Delete the image file with username segmentation
        await this.imageStorageService.deleteImage(
            ResourceType.User,
            certificateId,
            certificate.profileImage,
            'certificates',
            user.username,
        );

        // Remove image reference from certificate
        certificate.profileImage = null;
        return await this.certificateRepository.save(certificate);
    }
};
