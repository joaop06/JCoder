import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/user-component.exceptions';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

/**
 * Use case for uploading certificate images
 */
@Injectable()
export class UploadCertificateImageUseCase {
    constructor(
        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(
        userId: number,
        certificateId: number,
        file: Express.Multer.File,
    ): Promise<UserComponentCertificate> {
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

        // Delete old image if exists
        if (certificate.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.User,
                userId,
                certificate.profileImage,
                'certificates',
            );
        }

        // Upload new image
        const filename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.User,
            userId,
            ImageType.Component,
            'certificates',
        );

        // Update certificate with new image
        certificate.profileImage = filename;
        return await this.certificateRepository.save(certificate);
    }
}

