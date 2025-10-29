import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from '../../technologies/entities/technology.entity';
import { TechnologyNotFoundException } from '../../technologies/exceptions/technology-not-found.exception';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

@Injectable()
export class GetTechnologyProfileImageUseCase {
    constructor(
        @InjectRepository(Technology)
        private readonly technologyRepository: Repository<Technology>,
        private readonly imageStorageService: ImageStorageService,
    ) { }

    async execute(id: number): Promise<string> {
        const technology = await this.technologyRepository.findOne({ where: { id } });

        if (!technology) {
            throw new TechnologyNotFoundException();
        }

        if (!technology.profileImage) {
            throw new Error('Technology has no profile image');
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.Technology,
            id,
            technology.profileImage,
        );
    }
}

