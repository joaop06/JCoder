import { Injectable } from "@nestjs/common";
import { ApplicationTypeEnum } from "../enums/application-type.enum";
import { CreateComponentsForTypeDto } from "./dto/create-components-for-type.dto";
import { ApplicationComponentsRepository } from "./application-componets.reposiotry";

@Injectable()
export class ApplicationComponentsService {
    constructor(
        private readonly applicationComponentsRepository: ApplicationComponentsRepository,
    ) { }

    async saveComponentsForType({
        dtos,
        application,
        applicationType,
    }: CreateComponentsForTypeDto) {
        switch (applicationType) {
            case ApplicationTypeEnum.API:
                await this.applicationComponentsRepository.createApi({
                    application,
                    ...dtos.applicationComponentApi,
                });
                break;

            case ApplicationTypeEnum.FRONTEND:
                await this.applicationComponentsRepository.createFrontend({
                    application,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.FULLSTACK:
                await this.applicationComponentsRepository.createApi({
                    application,
                    ...dtos.applicationComponentApi,
                });
                await this.applicationComponentsRepository.createFrontend({
                    application,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.MOBILE:
                await this.applicationComponentsRepository.createMobile({
                    application,
                    ...dtos.applicationComponentMobile,
                });
                break;

            case ApplicationTypeEnum.LIBRARY:
                await this.applicationComponentsRepository.createLibrary({
                    application,
                    ...dtos.applicationComponentLibrary,
                });
                break;
        }
    }
};
