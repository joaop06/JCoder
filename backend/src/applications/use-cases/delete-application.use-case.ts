import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";

@Injectable()
export class DeleteApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: Application['id']): Promise<void> {
        return await this.applicationsService.delete(id);
    }
};
