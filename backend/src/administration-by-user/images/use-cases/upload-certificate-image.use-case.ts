import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';

/**
 * Use case for uploading certificate images
 */
@Injectable()
export class UploadCertificateImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
    ) { }

    async execute(
        username: string,
        certificateId: number,
        file: Express.Multer.File,
    ): Promise<UserComponentCertificate> {
        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            relations: ['user'],
            where: { id: certificateId },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        // Verify ownership
        if (certificate.user.username !== username) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        // Delete old image if exists
        if (certificate.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.User,
                certificateId,
                certificate.profileImage,
                'certificates',
                certificate.user.username,
            );
        }

        // Upload new image with username segmentation
        const filename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.User,
            certificateId,
            ImageType.Component,
            'certificates',
            certificate.user.username,
        );

        // Update certificate with new image
        certificate.profileImage = filename;
        return await this.certificateRepository.save(certificate);
    }
};
