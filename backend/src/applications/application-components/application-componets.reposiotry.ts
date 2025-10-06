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

    async createApi(object: Partial<ApplicationComponentApi>): Promise<ApplicationComponentApi> {
        const component = this.apiRepository.create(object);
        return await this.apiRepository.save(component);
    }

    async createMobile(object: Partial<ApplicationComponentMobile>): Promise<ApplicationComponentMobile> {
        const component = this.mobileRepository.create(object);
        return await this.mobileRepository.save(component);
    }

    async createLibrary(object: Partial<ApplicationComponentLibrary>): Promise<ApplicationComponentLibrary> {
        const component = this.libraryRepository.create(object);
        return await this.libraryRepository.save(component);
    }

    async createFrontend(object: Partial<ApplicationComponentFrontend>): Promise<ApplicationComponentFrontend> {
        const component = this.frontendRepository.create(object);
        return await this.frontendRepository.save(component);
    }
};
