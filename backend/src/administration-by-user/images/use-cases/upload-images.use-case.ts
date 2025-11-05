import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { CacheService } from '../../../@common/services/cache.service';
import { ImageStorageService } from '../services/image-storage.service';
import { Application } from '../../applications/entities/application.entity';

@Injectable()
export class UploadImagesUseCase {
    constructor(
        private readonly cacheService: CacheService,

        private readonly imagesService: ImagesService,

        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
    ) { }

    async execute(id: number, files: Express.Multer.File[]): Promise<Application> {
        const application = await this.imagesService.findApplicationById(id);

        // Upload new images using the generic service with username segmentation
        const newImageFilenames = await this.imageStorageService.uploadImages(
            files,
            ResourceType.Application,
            id,
            ImageType.Gallery,
            undefined,
            application.user.username,
        );

        // Merge with existing images
        const existingImages = application.images || [];
        application.images = [...existingImages, ...newImageFilenames];

        // Save and invalidate cache
        const updatedApplication = await this.applicationRepository.save(application);
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }
};
