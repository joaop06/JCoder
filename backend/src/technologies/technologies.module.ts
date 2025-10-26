import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ImagesModule } from '../images/images.module';
import { Technology } from './entities/technology.entity';
import { TechnologiesService } from './technologies.service';
import { CacheService } from '../@common/services/cache.service';
import { TechnologiesController } from './technologies.controller';
import { CreateTechnologyUseCase } from './use-cases/create-technology.use-case';
import { UpdateTechnologyUseCase } from './use-cases/update-technology.use-case';
import { DeleteTechnologyUseCase } from './use-cases/delete-technology.use-case';
import { UploadTechnologyProfileImageUseCase } from './use-cases/upload-technology-profile-image.use-case';
import { DeleteTechnologyProfileImageUseCase } from './use-cases/delete-technology-profile-image.use-case';

@Module({
    providers: [
        CacheService,
        TechnologiesService,
        CreateTechnologyUseCase,
        UpdateTechnologyUseCase,
        DeleteTechnologyUseCase,
        UploadTechnologyProfileImageUseCase,
        DeleteTechnologyProfileImageUseCase,
    ],
    controllers: [TechnologiesController],
    imports: [
        ConfigModule,
        ImagesModule,
        TypeOrmModule.forFeature([Technology]),
        CacheModule.register({
            ttl: 300, // 5 minutes default
            max: 100, // maximum number of items in cache
        }),
    ],
    exports: [TechnologiesService],
})
export class TechnologiesModule { }

