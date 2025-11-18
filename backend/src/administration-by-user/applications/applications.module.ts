import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from '../users/users.module';
import { ImagesModule } from '../images/images.module';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { CacheService } from '../../@common/services/cache.service';
import { ApplicationsController } from './applications.controller';
import { Technology } from '../technologies/entities/technology.entity';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ReorderApplicationUseCase } from './use-cases/reorder-application.use-case';
import { ApplicationComponentsModule } from './application-components/application-components.module';
import { DeleteApplicationComponentUseCase } from './use-cases/delete-application-component.use-case';

@Module({
  providers: [
    CacheService,
    ApplicationsService,
    CreateApplicationUseCase,
    DeleteApplicationUseCase,
    UpdateApplicationUseCase,
    ReorderApplicationUseCase,
    DeleteApplicationComponentUseCase,
  ],
  exports: [ApplicationsService],
  controllers: [ApplicationsController],
  imports: [
    UsersModule,
    ConfigModule,
    ImagesModule,
    ApplicationComponentsModule,
    TypeOrmModule.forFeature([Application, Technology]),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class ApplicationsModule { }

