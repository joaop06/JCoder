import { Repository } from "typeorm";
import { ApplicationComponentApi } from "./entities/application-component-api.entity";
import { ApplicationComponentMobile } from "./entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "./entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "./entities/application-component-frontend.entity";
export declare class ApplicationComponentsRepository {
    private readonly apiRepository;
    private readonly mobileRepository;
    private readonly libraryRepository;
    private readonly frontendRepository;
    constructor(apiRepository: Repository<ApplicationComponentApi>, mobileRepository: Repository<ApplicationComponentMobile>, libraryRepository: Repository<ApplicationComponentLibrary>, frontendRepository: Repository<ApplicationComponentFrontend>);
    createApi(object: Partial<ApplicationComponentApi>): Promise<ApplicationComponentApi>;
    createMobile(object: Partial<ApplicationComponentMobile>): Promise<ApplicationComponentMobile>;
    createLibrary(object: Partial<ApplicationComponentLibrary>): Promise<ApplicationComponentLibrary>;
    createFrontend(object: Partial<ApplicationComponentFrontend>): Promise<ApplicationComponentFrontend>;
    updateApi(applicationId: number, object: Partial<ApplicationComponentApi>): Promise<ApplicationComponentApi>;
    updateMobile(applicationId: number, object: Partial<ApplicationComponentMobile>): Promise<ApplicationComponentMobile>;
    updateLibrary(applicationId: number, object: Partial<ApplicationComponentLibrary>): Promise<ApplicationComponentLibrary>;
    updateFrontend(applicationId: number, object: Partial<ApplicationComponentFrontend>): Promise<ApplicationComponentFrontend>;
    deleteApi(applicationId: number): Promise<void>;
    deleteMobile(applicationId: number): Promise<void>;
    deleteLibrary(applicationId: number): Promise<void>;
    deleteFrontend(applicationId: number): Promise<void>;
    findApi(applicationId: number): Promise<ApplicationComponentApi | null>;
    findMobile(applicationId: number): Promise<ApplicationComponentMobile | null>;
    findLibrary(applicationId: number): Promise<ApplicationComponentLibrary | null>;
    findFrontend(applicationId: number): Promise<ApplicationComponentFrontend | null>;
}
