import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { AlreadyDeletedApplicationException } from "../exceptions/already-deleted-application.exception";

@Injectable()
export class DeleteApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly usersService: UsersService,
    ) { }

    async execute(username: string, id: Application['id']): Promise<void> {
        let application: Application;
        try {
            application = await this.applicationsService.findById(id, username);
        } catch {
            throw new AlreadyDeletedApplicationException();
        }

        // Store the displayOrder before deleting
        const deletedDisplayOrder = application.displayOrder;

        // Delete the application
        await this.applicationsService.delete(id);

        // Reorder remaining applications (decrement displayOrder of applications after the deleted one)
        await this.applicationsService.decrementDisplayOrderAfter(deletedDisplayOrder, username);
    }
};
