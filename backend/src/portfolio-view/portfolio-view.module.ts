import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PortfolioViewService } from './portfolio-view.service';
import { CacheService } from '../@common/services/cache.service';
import { PortfolioViewController } from './portfolio-view.controller';
import { UsersModule } from '../administration-by-user/users/users.module';
import { User } from '../administration-by-user/users/entities/user.entity';
import { UserRegistrationService } from './user-registration/user-registration.service';
import { UserRegistrationController } from './user-registration/user-registration.controller';
import { Technology } from '../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../administration-by-user/applications/entities/application.entity';
import { UserComponentAboutMe } from '../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../administration-by-user/users/user-components/entities/user-component-certificate.entity';

@Module({
  providers: [
    CacheService,
    PortfolioViewService,
    UserRegistrationService,
  ],
  controllers: [
    PortfolioViewController,
    UserRegistrationController,
  ],
  imports: [
    ConfigModule,
    UsersModule,
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
  exports: [PortfolioViewService],
})
export class PortfolioViewModule { };
