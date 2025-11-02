import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/user-component.exceptions';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

/**
 * Use case for getting certificate image path
 */
@Injectable()
export class GetCertificateImageUseCase {
    constructor(
        @InjectRepository(UserComponentCertificate)
        private readonly certificateRepository: Repository<UserComponentCertificate>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(certificateId: number): Promise<string> {
        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            where: { userId: certificateId },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        if (!certificate.profileImage) {
            throw new Error('Certificate has no profile image');
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.User,
            certificate.userId,
            certificate.profileImage,
            'certificates',
        );
    }
}

