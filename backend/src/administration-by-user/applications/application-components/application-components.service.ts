import { Injectable } from "@nestjs/common";
import { User } from "../../users/entities/user.entity";
import { Application } from "../entities/application.entity";
import { ApplicationComponentsDto } from "./dto/create-components-for-type.dto";
import { ApplicationComponentsRepository } from "./application-componets.reposiotry";

interface SaveComponentsDto {
    user: User;
    application: Application;
    dtos: ApplicationComponentsDto;
}

@Injectable()
export class ApplicationComponentsService {
    constructor(
        private readonly applicationComponentsRepository: ApplicationComponentsRepository,
    ) { }

    /**
     * Save components for a new application (create)
     * Creates components that are provided
     */
    async saveComponents({ user, application, dtos }: SaveComponentsDto): Promise<void> {
        const applicationId = application.id;

        // Handle API Component
        if (dtos.applicationComponentApi) {
            await this.applicationComponentsRepository.createApi({
                ...dtos.applicationComponentApi,
                application,
                userId: user.id,
            });
        }

        // Handle Mobile Component
        if (dtos.applicationComponentMobile) {
            await this.applicationComponentsRepository.createMobile({
                ...dtos.applicationComponentMobile,
                application,
                userId: user.id,
            });
        }

        // Handle Library Component
        if (dtos.applicationComponentLibrary) {
            await this.applicationComponentsRepository.createLibrary({
                ...dtos.applicationComponentLibrary,
                application,
                userId: user.id,
            });
        }

        // Handle Frontend Component
        if (dtos.applicationComponentFrontend) {
            await this.applicationComponentsRepository.createFrontend({
                ...dtos.applicationComponentFrontend,
                application,
                userId: user.id,
            });
        }
    }

    /**
     * Update components for an existing application
     * Only updates/creates components that are provided
     * Pass null to explicitly delete a component
     */
    async updateComponents({ user, application, dtos }: SaveComponentsDto): Promise<void> {
        const applicationId = application.id;

        // Handle API Component
        if (dtos.applicationComponentApi !== undefined) {
            if (dtos.applicationComponentApi === null) {
                // Explicitly delete if null is passed
                const existingApi = await this.applicationComponentsRepository.findApi(applicationId);
                if (existingApi) {
                    await this.applicationComponentsRepository.deleteApi(applicationId);
                }
            } else {
                const existingApi = await this.applicationComponentsRepository.findApi(applicationId);
                if (existingApi) {
                    await this.applicationComponentsRepository.updateApi(applicationId, {
                        ...dtos.applicationComponentApi,
                        userId: user.id,
                    });
                } else {
                    await this.applicationComponentsRepository.createApi({
                        ...dtos.applicationComponentApi,
                        application,
                        userId: user.id,
                    });
                }
            }
        }

        // Handle Mobile Component
        if (dtos.applicationComponentMobile !== undefined) {
            if (dtos.applicationComponentMobile === null) {
                const existingMobile = await this.applicationComponentsRepository.findMobile(applicationId);
                if (existingMobile) {
                    await this.applicationComponentsRepository.deleteMobile(applicationId);
                }
            } else {
                const existingMobile = await this.applicationComponentsRepository.findMobile(applicationId);
                if (existingMobile) {
                    await this.applicationComponentsRepository.updateMobile(applicationId, {
                        ...dtos.applicationComponentMobile,
                        userId: user.id,
                    });
                } else {
                    await this.applicationComponentsRepository.createMobile({
                        ...dtos.applicationComponentMobile,
                        application,
                        userId: user.id,
                    });
                }
            }
        }

        // Handle Library Component
        if (dtos.applicationComponentLibrary !== undefined) {
            if (dtos.applicationComponentLibrary === null) {
                const existingLibrary = await this.applicationComponentsRepository.findLibrary(applicationId);
                if (existingLibrary) {
                    await this.applicationComponentsRepository.deleteLibrary(applicationId);
                }
            } else {
                const existingLibrary = await this.applicationComponentsRepository.findLibrary(applicationId);
                if (existingLibrary) {
                    await this.applicationComponentsRepository.updateLibrary(applicationId, {
                        ...dtos.applicationComponentLibrary,
                        userId: user.id,
                    });
                } else {
                    await this.applicationComponentsRepository.createLibrary({
                        ...dtos.applicationComponentLibrary,
                        application,
                        userId: user.id,
                    });
                }
            }
        }

        // Handle Frontend Component
        if (dtos.applicationComponentFrontend !== undefined) {
            if (dtos.applicationComponentFrontend === null) {
                const existingFrontend = await this.applicationComponentsRepository.findFrontend(applicationId);
                if (existingFrontend) {
                    await this.applicationComponentsRepository.deleteFrontend(applicationId);
                }
            } else {
                const existingFrontend = await this.applicationComponentsRepository.findFrontend(applicationId);
                if (existingFrontend) {
                    await this.applicationComponentsRepository.updateFrontend(applicationId, {
                        ...dtos.applicationComponentFrontend,
                        userId: user.id,
                    });
                } else {
                    await this.applicationComponentsRepository.createFrontend({
                        ...dtos.applicationComponentFrontend,
                        application,
                        userId: user.id,
                    });
                }
            }
        }
    }

    /**
     * Delete a specific component from an application
     */
    async deleteComponent(applicationId: number, componentType: 'api' | 'mobile' | 'library' | 'frontend'): Promise<void> {
        switch (componentType) {
            case 'api':
                await this.applicationComponentsRepository.deleteApi(applicationId);
                break;
            case 'mobile':
                await this.applicationComponentsRepository.deleteMobile(applicationId);
                break;
            case 'library':
                await this.applicationComponentsRepository.deleteLibrary(applicationId);
                break;
            case 'frontend':
                await this.applicationComponentsRepository.deleteFrontend(applicationId);
                break;
        }
    }
};
