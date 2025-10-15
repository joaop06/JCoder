import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { AlreadyDeletedApplicationException } from "../exceptions/already-deleted-application.exception";

@Injectable()
export class DeleteApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: Application['id']): Promise<void> {
        try {
            await this.applicationsService.findById(id);
        } catch {
            throw new AlreadyDeletedApplicationException();
        }

        return await this.applicationsService.delete(id);
    }
};
