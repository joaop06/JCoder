import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class DeleteImageUseCase {
    constructor(
        private readonly cacheService: CacheService,

        private readonly imagesService: ImagesService,

        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
    ) { }

    async execute(id: number, filename: string): Promise<void> {
        // Find the application
        const application = await this.imagesService.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        // Delete the image file using the generic service with username segmentation
        await this.imageStorageService.deleteImage(
            ResourceType.Application,
            id,
            filename,
            undefined,
            application.user.username,
        );

        // Remove from application images array
        application.images = application.images.filter(img => img !== filename);
        await this.applicationRepository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));
    }
};
