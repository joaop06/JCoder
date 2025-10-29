import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Application } from '../applications/entities/application.entity';
import { Technology } from '../technologies/entities/technology.entity';
import { User } from '../users/entities/user.entity';
import { ImagesService } from './images.service';
import { CacheService } from '../@common/services/cache.service';
import { ImagesController } from './images.controller';
import { ImageUploadService } from './services/image-upload.service';
import { ImageStorageService } from './services/image-storage.service';

// Application use cases
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { GetImageUseCase } from './use-cases/get-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';

// Technology use cases
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';
import { GetTechnologyProfileImageUseCase } from './use-cases/get-technology-profile-image.use-case';

// User use cases
import { UploadUserProfileImageUseCase } from './use-cases/upload-user-profile-image.use-case';
import { DeleteUserProfileImageUseCase } from './use-cases/delete-user-profile-image.use-case';
import { GetUserProfileImageUseCase } from './use-cases/get-user-profile-image.use-case';
import { UploadUserComponentImageUseCase } from './use-cases/upload-user-component-image.use-case';
import { DeleteUserComponentImageUseCase } from './use-cases/delete-user-component-image.use-case';
import { GetUserComponentImageUseCase } from './use-cases/get-user-component-image.use-case';

// Certificate use cases
import { UploadCertificateImageUseCase } from './use-cases/upload-certificate-image.use-case';
import { DeleteCertificateImageUseCase } from './use-cases/delete-certificate-image.use-case';
import { GetCertificateImageUseCase } from './use-cases/get-certificate-image.use-case';
import { UserComponentCertificate } from '../users/user-components/entities/user-component-certificate.entity';

// Generic use cases
import { UploadResourceImageUseCase } from './use-cases/upload-resource-image.use-case';
import { UploadResourceImagesUseCase } from './use-cases/upload-resource-images.use-case';
import { GetResourceImageUseCase } from './use-cases/get-resource-image.use-case';
import { DeleteResourceImageUseCase } from './use-cases/delete-resource-image.use-case';
import { DeleteResourceImagesUseCase } from './use-cases/delete-resource-images.use-case';

@Module({
    providers: [
        // Core services
        CacheService,
        ImagesService,
        ImageUploadService,
        ImageStorageService,

        // Application use cases
        UploadImagesUseCase,
        DeleteImageUseCase,
        GetImageUseCase,
        UploadProfileImageUseCase,
        UpdateProfileImageUseCase,
        DeleteProfileImageUseCase,
        GetProfileImageUseCase,

        // Technology use cases
        UploadTechnologyProfileImageUseCase,
        DeleteTechnologyProfileImageUseCase,
        GetTechnologyProfileImageUseCase,

        // User use cases
        UploadUserProfileImageUseCase,
        DeleteUserProfileImageUseCase,
        GetUserProfileImageUseCase,
        UploadUserComponentImageUseCase,
        DeleteUserComponentImageUseCase,
        GetUserComponentImageUseCase,

        // Generic use cases
        UploadResourceImageUseCase,
        UploadResourceImagesUseCase,
        GetResourceImageUseCase,
        DeleteResourceImageUseCase,
        DeleteResourceImagesUseCase,

        // Certificate use cases
        UploadCertificateImageUseCase,
        DeleteCertificateImageUseCase,
        GetCertificateImageUseCase,
    ],
    controllers: [ImagesController],
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Application, Technology, User, UserComponentCertificate]),
        CacheModule.register({
            ttl: 300, // 5 minutes default
            max: 100, // maximum number of items in cache
        }),
    ],
    exports: [
        ImagesService,
        ImageUploadService,
        ImageStorageService,
        // Export use cases that might be used by other modules
        UploadResourceImageUseCase,
        UploadResourceImagesUseCase,
        GetResourceImageUseCase,
        DeleteResourceImageUseCase,
        DeleteResourceImagesUseCase,
        UploadUserProfileImageUseCase,
        DeleteUserProfileImageUseCase,
        GetUserProfileImageUseCase,
        UploadUserComponentImageUseCase,
        DeleteUserComponentImageUseCase,
        GetUserComponentImageUseCase,
        UploadCertificateImageUseCase,
        DeleteCertificateImageUseCase,
        GetCertificateImageUseCase,
    ],
})
export class ImagesModule { }
