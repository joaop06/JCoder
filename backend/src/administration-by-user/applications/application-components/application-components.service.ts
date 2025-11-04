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
        username,
        application,
        applicationType,
    }: CreateComponentsForTypeDto & { username: string }) {
        switch (applicationType) {
            case ApplicationTypeEnum.API:
                await this.applicationComponentsRepository.createApi({
                    application,
                    username,
                    ...dtos.applicationComponentApi,
                });
                break;

            case ApplicationTypeEnum.FRONTEND:
                await this.applicationComponentsRepository.createFrontend({
                    application,
                    username,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.FULLSTACK:
                await this.applicationComponentsRepository.createApi({
                    application,
                    username,
                    ...dtos.applicationComponentApi,
                });
                await this.applicationComponentsRepository.createFrontend({
                    application,
                    username,
                    ...dtos.applicationComponentFrontend,
                });
                break;

            case ApplicationTypeEnum.MOBILE:
                await this.applicationComponentsRepository.createMobile({
                    application,
                    username,
                    ...dtos.applicationComponentMobile,
                });
                break;

            case ApplicationTypeEnum.LIBRARY:
                await this.applicationComponentsRepository.createLibrary({
                    application,
                    username,
                    ...dtos.applicationComponentLibrary,
                });
                break;
        }
    }
};
