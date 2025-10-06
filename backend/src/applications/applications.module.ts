import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { CreateApplicationUseCase } from './use-cases/create-application.use-case';
import { DeleteApplicationUseCase } from './use-cases/delete-application.use-case';
import { UpdateApplicationUseCase } from './use-cases/update-application.use-case';
import { ApplicationComponentApi } from './entities/components/application-component-api.entity';
import { ApplicationComponentMobile } from './entities/components/application-component-mobile.entity';
import { ApplicationComponentLibrary } from './entities/components/application-component-library.entity';
import { ApplicationComponentFrontend } from './entities/components/application-component-frontend.entity';

@Module({
  providers: [
    ApplicationsService,
    CreateApplicationUseCase,
    DeleteApplicationUseCase,
    UpdateApplicationUseCase,
  ],
  controllers: [ApplicationsController],
  imports: [TypeOrmModule.forFeature([
    Application,
    ApplicationComponentApi,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
  ])],
})
export class ApplicationsModule { }

