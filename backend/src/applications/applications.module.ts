import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from '../users/users.module';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { CacheService } from '../@common/services/cache.service';
import { ApplicationsController } from './applications.controller';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ApplicationComponentsModule } from './application-components/application-components.module';

@Module({
  providers: [
    CacheService,
    ApplicationsService,
    CreateApplicationUseCase,
    DeleteApplicationUseCase,
    UpdateApplicationUseCase,
  ],
  controllers: [ApplicationsController],
  imports: [
    UsersModule,
    ApplicationComponentsModule,
    TypeOrmModule.forFeature([Application]),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class ApplicationsModule { }

