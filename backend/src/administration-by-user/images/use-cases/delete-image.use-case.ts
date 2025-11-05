import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class DeleteImageUseCase {
    constructor(
        private readonly cacheService: CacheService,

        private readonly usersService: UsersService,

        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
    ) { }

    async execute(id: number, filename: string): Promise<void> {
        // Find the application
        const application = await this.findApplicationById(id);

        // Find the user
        const user = await this.usersService.findOneBy({ id: application.userId });

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        // Delete the image file using the generic service with username segmentation
        await this.imageStorageService.deleteImage(
            ResourceType.Application,
            id,
            filename,
            undefined,
            user.username,
        );

        // Remove from application images array
        application.images = application.images.filter(img => img !== filename);
        await this.applicationRepository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
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
