import { Injectable } from '@nestjs/common';
import { Technology } from '../entities/technology.entity';
import { TechnologiesService } from '../technologies.service';
import { TechnologyNotFoundException } from '../exceptions/technology-not-found.exception';

@Injectable()
export class DeleteTechnologyUseCase {
    constructor(
        private readonly technologiesService: TechnologiesService,
    ) { }

    async execute(username: string, id: number): Promise<void> {
        let technology: Technology;
        try {
            technology = await this.technologiesService.findById(id, username);
        } catch {
            throw new TechnologyNotFoundException();
        }

        // Store the displayOrder before deleting
        const deletedDisplayOrder = technology.displayOrder;

        // Soft delete the technology
        await this.technologiesService.delete(id);

        // Reorder remaining technologies (decrement displayOrder of technologies after the deleted one)
        await this.technologiesService.decrementDisplayOrderAfter(deletedDisplayOrder, username);
    }
};
