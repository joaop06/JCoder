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

    async updateApi(applicationId: number, object: Partial<ApplicationComponentApi>): Promise<ApplicationComponentApi> {
        await this.apiRepository.update({ applicationId }, object);
        return await this.apiRepository.findOneBy({ applicationId });
    }

    async updateMobile(applicationId: number, object: Partial<ApplicationComponentMobile>): Promise<ApplicationComponentMobile> {
        await this.mobileRepository.update({ applicationId }, object);
        return await this.mobileRepository.findOneBy({ applicationId });
    }

    async updateLibrary(applicationId: number, object: Partial<ApplicationComponentLibrary>): Promise<ApplicationComponentLibrary> {
        await this.libraryRepository.update({ applicationId }, object);
        return await this.libraryRepository.findOneBy({ applicationId });
    }

    async updateFrontend(applicationId: number, object: Partial<ApplicationComponentFrontend>): Promise<ApplicationComponentFrontend> {
        await this.frontendRepository.update({ applicationId }, object);
        return await this.frontendRepository.findOneBy({ applicationId });
    }

    async deleteApi(applicationId: number): Promise<void> {
        await this.apiRepository.delete({ applicationId });
    }

    async deleteMobile(applicationId: number): Promise<void> {
        await this.mobileRepository.delete({ applicationId });
    }

    async deleteLibrary(applicationId: number): Promise<void> {
        await this.libraryRepository.delete({ applicationId });
    }

    async deleteFrontend(applicationId: number): Promise<void> {
        await this.frontendRepository.delete({ applicationId });
    }

    async findApi(applicationId: number): Promise<ApplicationComponentApi | null> {
        return await this.apiRepository.findOneBy({ applicationId });
    }

    async findMobile(applicationId: number): Promise<ApplicationComponentMobile | null> {
        return await this.mobileRepository.findOneBy({ applicationId });
    }

    async findLibrary(applicationId: number): Promise<ApplicationComponentLibrary | null> {
        return await this.libraryRepository.findOneBy({ applicationId });
    }

    async findFrontend(applicationId: number): Promise<ApplicationComponentFrontend | null> {
        return await this.frontendRepository.findOneBy({ applicationId });
    }
};
