import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { CacheService } from '../../../@common/services/cache.service';
import { Application } from '../../applications/entities/application.entity';

@Injectable()
export class UploadProfileImageUseCase {
    constructor(
        private readonly cacheService: CacheService,

        private readonly imagesService: ImagesService,

        private readonly imageStorageService: ImageStorageService,

        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        const application = await this.imagesService.findApplicationById(id);

        // Delete existing profile image if it exists
        if (application.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.Application,
                id,
                application.profileImage,
                undefined,
                application.user.username,
            );
        }

        // Upload new profile image with username segmentation
        const profileImageFilename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.Application,
            id,
            ImageType.Profile,
            undefined,
            application.user.username,
        );

        // Update application with new profile image
        application.profileImage = profileImageFilename;
        const updatedApplication = await this.applicationRepository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }
};
