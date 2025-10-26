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

        // Soft delete the technology
        await this.technologiesService.softDelete(id);
    }
}

