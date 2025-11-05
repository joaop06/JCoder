import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';

@Injectable()
export class UploadTechnologyProfileImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Technology)
        private readonly technologyRepository: Repository<Technology>,
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
};
