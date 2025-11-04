import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';
import { CacheService } from '../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class UploadImagesUseCase {
    constructor(
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        private readonly imageStorageService: ImageStorageService,
        private readonly cacheService: CacheService,
    ) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<Application> {
        const application = await this.findApplicationById(id);

        // Upload new images using the generic service with username segmentation
        const newImageFilenames = await this.imageStorageService.uploadImages(
            files,
            ResourceType.Application,
            id,
            ImageType.Gallery,
            undefined,
            application.username,
        );

        // Merge with existing images
        const existingImages = application.images || [];
        application.images = [...existingImages, ...newImageFilenames];

        // Save and invalidate cache
        const updatedApplication = await this.applicationRepository.save(application);
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
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
