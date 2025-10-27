import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Application } from '../applications/entities/application.entity';
import { Technology } from '../technologies/entities/technology.entity';
import { ImagesService } from './images.service';
import { CacheService } from '../@common/services/cache.service';
import { ImagesController } from './images.controller';
import { ImageUploadService } from './services/image-upload.service';
import { UploadImagesUseCase } from './use-cases/upload-images.use-case';
import { DeleteImageUseCase } from './use-cases/delete-image.use-case';
import { GetImageUseCase } from './use-cases/get-image.use-case';
import { UploadProfileImageUseCase } from './use-cases/upload-profile-image.use-case';
import { UpdateProfileImageUseCase } from './use-cases/update-profile-image.use-case';
import { DeleteProfileImageUseCase } from './use-cases/delete-profile-image.use-case';
import { GetProfileImageUseCase } from './use-cases/get-profile-image.use-case';
import { TechnologiesService } from '../technologies/technologies.service';
import { UploadTechnologyProfileImageUseCase } from '../technologies/use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from '../technologies/use-cases/delete-technology-profile-image.use-case';
import { GetTechnologyProfileImageUseCase } from '../technologies/use-cases/get-technology-profile-image.use-case';

@Module({
    providers: [
        CacheService,
        ImagesService,
        ImageUploadService,
        UploadImagesUseCase,
        DeleteImageUseCase,
        GetImageUseCase,
        UploadProfileImageUseCase,
        UpdateProfileImageUseCase,
        DeleteProfileImageUseCase,
        GetProfileImageUseCase,
        TechnologiesService,
        UploadTechnologyProfileImageUseCase,
        DeleteTechnologyProfileImageUseCase,
        GetTechnologyProfileImageUseCase,
    ],
    controllers: [ImagesController],
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Application, Technology]),
        CacheModule.register({
            ttl: 300, // 5 minutes default
            max: 100, // maximum number of items in cache
        }),
    ],
    exports: [
        ImagesService,
        ImageUploadService,
    ],
})
export class ImagesModule { }
