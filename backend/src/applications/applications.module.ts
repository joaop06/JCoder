import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ApplicationComponentsModule } from './application-components/application-components.module';

@Module({
  providers: [
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
  ],
})
export class ApplicationsModule { }

