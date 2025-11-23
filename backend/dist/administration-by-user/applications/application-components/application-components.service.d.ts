import { User } from "../../users/entities/user.entity";
import { Application } from "../entities/application.entity";
import { ApplicationComponentsDto } from "./dto/create-components-for-type.dto";
import { ApplicationComponentsRepository } from "./application-componets.reposiotry";
interface SaveComponentsDto {
    user: User;
    application: Application;
    dtos: ApplicationComponentsDto;
}
export declare class ApplicationComponentsService {
    private readonly applicationComponentsRepository;
    constructor(applicationComponentsRepository: ApplicationComponentsRepository);
    saveComponents({ user, application, dtos }: SaveComponentsDto): Promise<void>;
    updateComponents({ user, application, dtos }: SaveComponentsDto): Promise<void>;
    deleteComponent(applicationId: number, componentType: 'api' | 'mobile' | 'library' | 'frontend'): Promise<void>;
}
export {};
