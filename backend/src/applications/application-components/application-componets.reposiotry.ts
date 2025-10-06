import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationComponentApi } from "./entities/application-component-api.entity";
import { ApplicationComponentMobile } from "./entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "./entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "./entities/application-component-frontend.entity";

@Injectable()
export class ApplicationComponentsRepository {
    constructor(
        @InjectRepository(ApplicationComponentApi)
        private readonly apiRepository: Repository<ApplicationComponentApi>,

        @InjectRepository(ApplicationComponentMobile)
        private readonly mobileRepository: Repository<ApplicationComponentMobile>,

        @InjectRepository(ApplicationComponentLibrary)
        private readonly libraryRepository: Repository<ApplicationComponentLibrary>,

        @InjectRepository(ApplicationComponentFrontend)
        private readonly frontendRepository: Repository<ApplicationComponentFrontend>,
    ) { }

    createApi(object: Partial<ApplicationComponentApi>): ApplicationComponentApi {
        return this.apiRepository.create(object);
    }

    createMobile(object: Partial<ApplicationComponentMobile>): ApplicationComponentMobile {
        return this.mobileRepository.create(object);
    }

    createLibrary(object: Partial<ApplicationComponentLibrary>): ApplicationComponentLibrary {
        return this.libraryRepository.create(object);
    }

    createFrontend(object: Partial<ApplicationComponentFrontend>): ApplicationComponentFrontend {
        return this.frontendRepository.create(object);
    }
};
