import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '../users/entities/user.entity';
import { ImagesController } from './images.controller';
import { CacheService } from '../../@common/services/cache.service';
import { ImageUploadService } from './services/image-upload.service';
import { ImageStorageService } from './services/image-storage.service';
import { Technology } from '../technologies/entities/technology.entity';
import { Application } from '../applications/entities/application.entity';

// Application use cases
import { GetImageUseCase } from './use-cases/get-image.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';

// Technology use cases
import { GetTechnologyProfileImageUseCase } from './use-cases/get-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';

// User use cases
import { GetUserProfileImageUseCase } from './use-cases/get-user-profile-image.use-case';
import { DeleteUserProfileImageUseCase } from './use-cases/delete-user-profile-image.use-case';
import { UploadUserProfileImageUseCase } from './use-cases/upload-user-profile-image.use-case';

// Certificate use cases
import { GetCertificateImageUseCase } from './use-cases/get-certificate-image.use-case';
import { DeleteCertificateImageUseCase } from './use-cases/delete-certificate-image.use-case';
import { UploadCertificateImageUseCase } from './use-cases/upload-certificate-image.use-case';
import { UserComponentCertificate } from '../users/user-components/entities/user-component-certificate.entity';

@Module({
    providers: [
        // Core services
        CacheService,
        ImagesService,
        ImageUploadService,
        ImageStorageService,

        // Application use cases
        GetImageUseCase,
        DeleteImageUseCase,
        UploadImagesUseCase,
        GetProfileImageUseCase,
        DeleteProfileImageUseCase,
        UpdateProfileImageUseCase,
        UploadProfileImageUseCase,

        // Technology use cases
        GetTechnologyProfileImageUseCase,
        DeleteTechnologyProfileImageUseCase,
        UploadTechnologyProfileImageUseCase,

        // User use cases
        GetUserProfileImageUseCase,
        DeleteUserProfileImageUseCase,
        UploadUserProfileImageUseCase,

        // Certificate use cases
        GetCertificateImageUseCase,
        DeleteCertificateImageUseCase,
        UploadCertificateImageUseCase,
    ],
    controllers: [ImagesController],
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
            User,
            Technology,
            Application,
            UserComponentCertificate,
        ]),
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
        GetUserProfileImageUseCase,
        GetCertificateImageUseCase,
        DeleteCertificateImageUseCase,
        DeleteUserProfileImageUseCase,
        UploadCertificateImageUseCase,
        UploadUserProfileImageUseCase,
    ],
})
export class ImagesModule { }
