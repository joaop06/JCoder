import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { UpdateTechnologyDto } from '../dto/update-technology.dto';
import { TechnologyAlreadyExistsException } from '../exceptions/technology-already-exists.exception';

@Injectable()
export class UpdateTechnologyUseCase {
    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(
        id: number,
        updateTechnologyDto: UpdateTechnologyDto,
    ): Promise<Technology> {
        // Ensure technology exists
        await this.technologiesService.findById(id);

        // If updating name, verify uniqueness
        if (updateTechnologyDto.name) {
            const exists = await this.technologiesService.findOneBy({
                name: updateTechnologyDto.name,
            });
            if (exists && exists.id !== id) {
                throw new TechnologyAlreadyExistsException(updateTechnologyDto.name);
            }
        }

        // Update the technology
        return await this.technologiesService.update(id, updateTechnologyDto);
    }
}

