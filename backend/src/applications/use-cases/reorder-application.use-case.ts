import { Injectable } from '@nestjs/common';
import { Application } from '../entities/application.entity';
import { ApplicationsService } from '../applications.service';
import { ReorderApplicationDto } from '../dto/reorder-application.dto';

@Injectable()
export class ReorderApplicationUseCase {
    constructor(private readonly applicationsService: ApplicationsService) { }

    async execute(
        id: number,
        reorderApplicationDto: ReorderApplicationDto,
    ): Promise<Application> {
        // Ensure application exists
        const existingApplication = await this.applicationsService.findById(id);

        // Check if displayOrder is actually changing
        if (reorderApplicationDto.displayOrder === existingApplication.displayOrder) {
            return existingApplication;
        }

        // Reorder other applications
        await this.applicationsService.reorderOnUpdate(
            id,
            existingApplication.displayOrder,
            reorderApplicationDto.displayOrder,
        );

        // Update the application's displayOrder
        return await this.applicationsService.update(id, {
            displayOrder: reorderApplicationDto.displayOrder,
        });
    }
}

