import { Injectable } from "@nestjs/common";
import { Application } from "../entities/application.entity";
import { ApplicationsService } from "../applications.service";
import { CreateApplicationDto } from "../dto/create-application.dto";

@Injectable()
export class CreateApplicationUseCase {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    async execute(createApplicationDto: CreateApplicationDto): Promise<Application> {
        return await this.applicationsService.create(createApplicationDto);
    }
};
