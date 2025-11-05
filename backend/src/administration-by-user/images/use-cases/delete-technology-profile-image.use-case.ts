import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { Technology } from '../../technologies/entities/technology.entity';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';

@Injectable()
export class DeleteTechnologyProfileImageUseCase {
    constructor(
        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Technology)
        private readonly technologyRepository: Repository<Technology>,
    ) { }

    async execute(id: number): Promise<Technology> {
        const technology = await this.technologyRepository.findOne({ where: { id } });

        if (!technology) {
            throw new TechnologyNotFoundException();
        }

        // Verify if has profile image
        if (!technology.profileImage) {
            return technology;
        }

        // Delete profile image file
        await this.imageStorageService.deleteImage(
            ResourceType.Technology,
            id,
            technology.profileImage,
        );

        // Update technology removing profile image reference
        technology.profileImage = null;
        return await this.technologyRepository.save(technology);
    }
}

