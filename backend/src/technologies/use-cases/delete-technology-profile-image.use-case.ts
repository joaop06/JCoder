import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { ImageUploadService } from '../../images/services/image-upload.service';

@Injectable()
export class DeleteTechnologyProfileImageUseCase {
    constructor(
        private readonly technologiesService: TechnologiesService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    async execute(id: number): Promise<Technology> {
        // Find the technology
        const technology = await this.technologiesService.findById(id);

        // Verify if has profile image
        if (!technology.profileImage) {
            return technology;
        }

        // Delete profile image file
        await this.imageUploadService.deleteFile(
            'technologies',
            technology.profileImage,
        );

        // Update technology removing profile image reference
        return await this.technologiesService.update(id, {
            profileImage: null,
        });
    }
}

