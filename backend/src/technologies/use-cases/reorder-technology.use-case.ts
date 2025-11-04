import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { ReorderTechnologyDto } from '../dto/reorder-technology.dto';

@Injectable()
export class ReorderTechnologyUseCase {
    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(
        username: string,
        id: number,
        reorderTechnologyDto: ReorderTechnologyDto,
    ): Promise<Technology> {
        // Ensure technology exists
        const existingTechnology = await this.technologiesService.findById(id, username);

        // Check if displayOrder is actually changing
        if (reorderTechnologyDto.displayOrder === existingTechnology.displayOrder) {
            return existingTechnology;
        }

        // Reorder other technologies
        await this.technologiesService.reorderOnUpdate(
            id,
            existingTechnology.displayOrder,
            reorderTechnologyDto.displayOrder,
            username,
        );

        // Update the technology's displayOrder
        await this.technologiesService.update(id, {
            displayOrder: reorderTechnologyDto.displayOrder,
        });

        return await this.technologiesService.findById(id, username);
    }
};
