import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Application } from '../entities/application.entity';
import { ApplicationsService } from '../applications.service';
import { ReorderApplicationDto } from '../dto/reorder-application.dto';

@Injectable()
export class ReorderApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly usersService: UsersService,
    ) { }

    async execute(
        username: string,
        id: number,
        reorderApplicationDto: ReorderApplicationDto,
    ): Promise<Application> {
        // Ensure application exists for this user
        const existingApplication = await this.applicationsService.findById(id, username);

        // Check if displayOrder is actually changing
        if (reorderApplicationDto.displayOrder === existingApplication.displayOrder) {
            return existingApplication;
        }

        // Reorder other applications
        await this.applicationsService.reorderOnUpdate(
            id,
            existingApplication.displayOrder,
            reorderApplicationDto.displayOrder,
            username,
        );

        // Update the application's displayOrder
        await this.applicationsService.update(id, {
            displayOrder: reorderApplicationDto.displayOrder,
        });

        return await this.applicationsService.findById(id, username);
    }
};
