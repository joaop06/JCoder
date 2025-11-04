import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';
import { CacheService } from '../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';

@Injectable()
export class GetProfileImageUseCase {
    constructor(
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        private readonly imageStorageService: ImageStorageService,
        private readonly cacheService: CacheService,
    ) { }

    async execute(id: number): Promise<string> {
        const application = await this.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageStorageService.getImagePath(
            ResourceType.Application,
            id,
            application.profileImage,
            undefined,
            application.username,
        );
    }

    private async findApplicationById(id: number): Promise<Application> {
        const cacheKey = this.cacheService.applicationKey(id, 'full');

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const application = await this.applicationRepository.findOne({
                    where: { id },
                    relations: {
                        applicationComponentApi: true,
                        applicationComponentMobile: true,
                        applicationComponentLibrary: true,
                        applicationComponentFrontend: true,
                    },
                });
                if (!application) throw new ApplicationNotFoundException();
                return application;
            },
            600,
        );
    }
}
