import { Injectable } from '@nestjs/common';
import { TechnologiesService } from '../technologies.service';
import { TechnologyAlreadyDeletedException } from '../exceptions/technology-already-deleted.exception';

@Injectable()
export class DeleteTechnologyUseCase {
    constructor(private readonly technologiesService: TechnologiesService) { }

    async execute(id: number): Promise<void> {
        // Find technology and verify if it exists
        const technology = await this.technologiesService.findById(id);

        // Verify if already deleted
        if (technology.deletedAt) {
            throw new TechnologyAlreadyDeletedException();
        }

        // Store the displayOrder before deleting
        const deletedDisplayOrder = technology.displayOrder;

        // Soft delete the technology
        await this.technologiesService.softDelete(id);

        // Reorder remaining technologies (decrement displayOrder of technologies after the deleted one)
        await this.technologiesService.decrementDisplayOrderAfter(deletedDisplayOrder);
    }
}

