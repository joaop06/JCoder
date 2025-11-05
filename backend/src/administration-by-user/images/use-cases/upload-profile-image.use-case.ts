import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageType } from '../enums/image-type.enum';
import { UsersService } from '../../users/users.service';
import { ResourceType } from '../enums/resource-type.enum';
import { ImageStorageService } from '../services/image-storage.service';
import { CacheService } from '../../../@common/services/cache.service';
import { Application } from '../../applications/entities/application.entity';
import { ApplicationNotFoundException } from '../../applications/exceptions/application-not-found.exception';

@Injectable()
export class UploadProfileImageUseCase {
    constructor(
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        private readonly imageStorageService: ImageStorageService,
        private readonly cacheService: CacheService,
        private readonly usersService: UsersService,
    ) { }

    async execute(id: number, file: Express.Multer.File): Promise<Application> {
        const application = await this.findApplicationById(id);

        const user = await this.usersService.findOneBy({ id: application.userId });

        // Delete existing profile image if it exists
        if (application.profileImage) {
            await this.imageStorageService.deleteImage(
                ResourceType.Application,
                id,
                application.profileImage,
                undefined,
                user.username,
            );
        }

        // Upload new profile image with username segmentation
        const profileImageFilename = await this.imageStorageService.uploadImage(
            file,
            ResourceType.Application,
            id,
            ImageType.Profile,
            undefined,
            user.username,
        );

        // Update application with new profile image
        application.profileImage = profileImageFilename;
        const updatedApplication = await this.applicationRepository.save(application);

        // Invalidate cache
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
