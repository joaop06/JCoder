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
        user,
        application,
        applicationType,
    }: CreateComponentsForTypeDto) {
        switch (applicationType) {
            case ApplicationTypeEnum.API:
                await this.applicationComponentsRepository.createApi({
                    ...dtos.applicationComponentApi,
                    application,
                    userId: user.id,
                });
                break;

            case ApplicationTypeEnum.FRONTEND:
                await this.applicationComponentsRepository.createFrontend({
                    ...dtos.applicationComponentFrontend,
                    application,
                    userId: user.id,
                });
                break;

            case ApplicationTypeEnum.FULLSTACK:
                await this.applicationComponentsRepository.createApi({
                    ...dtos.applicationComponentApi,
                    application,
                    userId: user.id,
                });
                await this.applicationComponentsRepository.createFrontend({
                    ...dtos.applicationComponentFrontend,
                    application,
                    userId: user.id,
                });
                break;

            case ApplicationTypeEnum.MOBILE:
                await this.applicationComponentsRepository.createMobile({
                    ...dtos.applicationComponentMobile,
                    application,
                    userId: user.id,
                });
                break;

            case ApplicationTypeEnum.LIBRARY:
                await this.applicationComponentsRepository.createLibrary({
                    ...dtos.applicationComponentLibrary,
                    application,
                    userId: user.id,
                });
                break;
        }
    }
};
