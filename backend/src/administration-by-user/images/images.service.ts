import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../../@common/services/cache.service';
import { Application } from '../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';

@Injectable()
export class ImagesService {
    constructor(
        private readonly cacheService: CacheService,

        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
    ) { }

    async findApplicationById(id: number): Promise<Application> {
        const cacheKey = this.cacheService.applicationKey(id, 'full');

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const application = await this.applicationRepository.findOne({
                    where: { id },
                    relations: {
                        user: true,
                        applicationComponentApi: true,
                        applicationComponentMobile: true,
                        applicationComponentLibrary: true,
                        applicationComponentFrontend: true,
                    },
                });
                if (!application) throw new ApplicationNotFoundException();
                return application;
            },
            600, // 10 minutes cache
        );
    }
};
