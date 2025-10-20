import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../applications/entities/application.entity';
import { CacheService } from '../@common/services/cache.service';
import { ImageUploadService } from './services/image-upload.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ApplicationNotFoundException } from '../applications/exceptions/application-not-found.exception';

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(Application)
        private readonly repository: Repository<Application>,
        private readonly cacheService: CacheService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    async findApplicationById(id: number): Promise<Application> {
        const cacheKey = this.cacheService.applicationKey(id, 'full');

        return await this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const application = await this.repository.findOne({
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

    async uploadImages(id: number, files: Express.Multer.File[]): Promise<Application> {
        const application = await this.findApplicationById(id);

        // Upload new images
        const newImageFilenames = await this.imageUploadService.uploadImages(files, id);

        // Merge with existing images
        const existingImages = application.images || [];
        const updatedImages = [...existingImages, ...newImageFilenames];

        // Update application with new images
        application.images = updatedImages;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async deleteImage(id: number, filename: string): Promise<Application> {
        const application = await this.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        // Delete the image file
        await this.imageUploadService.deleteApplicationImages(id, [filename]);

        // Remove from application images array
        application.images = application.images.filter(img => img !== filename);
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async getImagePath(id: number, filename: string): Promise<string> {
        const application = await this.findApplicationById(id);

        if (!application.images || !application.images.includes(filename)) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageUploadService.getImagePath(id, filename);
    }

    async uploadProfileImage(id: number, file: Express.Multer.File): Promise<Application> {
        const application = await this.findApplicationById(id);

        // Delete existing profile image if it exists
        if (application.profileImage) {
            await this.imageUploadService.deleteApplicationImages(id, [application.profileImage]);
        }

        // Upload new profile image
        const profileImageFilename = await this.imageUploadService.uploadProfileImage(file, id);

        // Update application with new profile image
        application.profileImage = profileImageFilename;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async updateProfileImage(id: number, file: Express.Multer.File): Promise<Application> {
        // This is essentially the same as uploadProfileImage since it replaces the existing one
        return await this.uploadProfileImage(id, file);
    }

    async deleteProfileImage(id: number): Promise<Application> {
        const application = await this.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        // Delete the profile image file
        await this.imageUploadService.deleteApplicationImages(id, [application.profileImage]);

        // Remove profile image from application
        application.profileImage = null;
        const updatedApplication = await this.repository.save(application);

        // Invalidate cache
        await this.cacheService.del(this.cacheService.applicationKey(id, 'full'));

        return updatedApplication;
    }

    async getProfileImagePath(id: number): Promise<string> {
        const application = await this.findApplicationById(id);

        if (!application.profileImage) {
            throw new ApplicationNotFoundException();
        }

        return await this.imageUploadService.getProfileImagePath(id, application.profileImage);
    }
};
