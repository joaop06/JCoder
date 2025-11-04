import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceType } from '../enums/resource-type.enum';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
import { ComponentNotFoundException } from '../../users/user-components/exceptions/component-not-found.exceptions';
import { ImageStorageService } from '../services/image-storage.service';

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

    async execute(username: string, certificateId: number): Promise<string> {
        // Find the certificate
        const certificate = await this.certificateRepository.findOne({
            where: { id: certificateId, username },
        });

        if (!certificate) {
            throw new ComponentNotFoundException('Certificate not found');
        }

        if (!certificate.profileImage) {
            throw new Error('Certificate has no profile image');
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.User,
            certificate.username,
            certificate.profileImage,
            'certificates',
        );
    }
}

