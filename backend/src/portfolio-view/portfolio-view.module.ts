import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../@common/services/cache.service';
import { PortfolioViewController } from './portfolio-view.controller';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case';
import { UsersModule } from '../administration-by-user/users/users.module';
import { User } from '../administration-by-user/users/entities/user.entity';
import { GetExperiencesUseCase } from './use-cases/get-experiences.use-case';
import { GetCertificatesUseCase } from './use-cases/get-certificates.use-case';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case';
import { GetTechnologiesUseCase } from './use-cases/get-technologies.use-case';
import { MessagesModule } from '../administration-by-user/messages/messages.module';
import { GetApplicationDetailsUseCase } from './use-cases/get-application-details.use-case';
import { GetProfileWithAboutMeUseCase } from './use-cases/get-profile-with-about-me.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { Technology } from '../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../administration-by-user/applications/entities/application.entity';
import { CheckUsernameAvailabilityUseCase } from './use-cases/check-username-availability.use-case';
import { UserComponentAboutMe } from '../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../administration-by-user/users/user-components/entities/user-component-certificate.entity';

@Module({
  providers: [
    CacheService,
    GetEducationsUseCase,
    GetExperiencesUseCase,
    GetApplicationsUseCase,
    GetCertificatesUseCase,
    GetTechnologiesUseCase,
    CreateUserUseCase,
    GetApplicationDetailsUseCase,
    GetProfileWithAboutMeUseCase,
    CheckUsernameAvailabilityUseCase,
  ],
  controllers: [
    PortfolioViewController,
  ],
  imports: [
    UsersModule,
    ConfigModule,
    MessagesModule,
    TypeOrmModule.forFeature([
      User,
      Technology,
      Application,
      UserComponentAboutMe,
      UserComponentEducation,
      UserComponentExperience,
      UserComponentCertificate,
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class PortfolioViewModule { };
