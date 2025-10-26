import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { ImageUploadService } from '../../images/services/image-upload.service';

@Injectable()
export class UploadTechnologyProfileImageUseCase {
    constructor(
        private readonly technologiesService: TechnologiesService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Technology> {
        // Find the technology
        const technology = await this.technologiesService.findById(id);

        // Delete old profile image if exists
        if (technology.profileImage) {
            await this.imageUploadService.deleteFile(
                'technologies',
                technology.profileImage,
            );
        }

        // Upload new profile image
        const filename = await this.imageUploadService.uploadFile(
            file,
            'technologies',
        );

        // Update technology with new profile image
        return await this.technologiesService.update(id, {
            profileImage: filename,
        });
    }
}

