import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from '../../technologies/entities/technology.entity';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class UploadTechnologyProfileImageUseCase {
    constructor(
        @InjectRepository(Technology)
        private readonly technologyRepository: Repository<Technology>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Technology> {
        const technology = await this.technologyRepository.findOne({ where: { id } });

        if (!technology) {
            throw new TechnologyNotFoundException();
        }

        // Delete old profile image if exists
        if (technology.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.Technology,
                id,
                technology.profileImage,
            );
        }

        // Upload new profile image
        const filename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.Technology,
            id,
            ImageType.Profile,
        );

        // Update technology with new profile image
        technology.profileImage = filename;
        return await this.technologyRepository.save(technology);
    }
}

