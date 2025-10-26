import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { CreateTechnologyDto } from '../dto/create-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

@Injectable()
export class CreateTechnologyUseCase {
    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(
        createTechnologyDto: CreateTechnologyDto,
    ): Promise<Technology> {
        // Verify if technology with same name already exists
        const exists = await this.technologiesService.findOneBy({
            name: createTechnologyDto.name,
        });
        if (exists) {
            throw new TechnologyAlreadyExistsException(createTechnologyDto.name);
        }

        // Create the technology
        return await this.technologiesService.create(createTechnologyDto);
    }
}

