import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { UpdateApplicationDto } from "../dto/update-application.dto";

@Injectable()
export class UpdateApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(id: Application['id'], updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        return await this.applicationsService.update(id, updateApplicationDto);
    }
};
