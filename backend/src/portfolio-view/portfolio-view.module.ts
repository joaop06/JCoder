import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from '../email/email.module';
import { CacheService } from '../@common/services/cache.service';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { PortfolioViewController } from './portfolio-view.controller';
import { EmailVerification } from './entities/email-verification.entity';
import { GetEducationsUseCase } from './use-cases/get-educations.use-case';
import { UsersModule } from '../administration-by-user/users/users.module';
import { User } from '../administration-by-user/users/entities/user.entity';
import { GetExperiencesUseCase } from './use-cases/get-experiences.use-case';
import { GetCertificatesUseCase } from './use-cases/get-certificates.use-case';
import { GetReferencesUseCase } from './use-cases/get-references.use-case';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case';
import { GetTechnologiesUseCase } from './use-cases/get-technologies.use-case';
import { VerifyEmailCodeUseCase } from './use-cases/verify-email-code.use-case';
import { MessagesModule } from '../administration-by-user/messages/messages.module';
import { GetApplicationDetailsUseCase } from './use-cases/get-application-details.use-case';
import { SendEmailVerificationUseCase } from './use-cases/send-email-verification.use-case';
import { CheckEmailAvailabilityUseCase } from './use-cases/check-email-availability.use-case';
import { GetProfileWithAboutMeUseCase } from './use-cases/get-profile-with-about-me.use-case';
import { Technology } from '../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../administration-by-user/applications/entities/application.entity';
import { CheckUsernameAvailabilityUseCase } from './use-cases/check-username-availability.use-case';
import { UserComponentAboutMe } from '../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { UserComponentEducation } from '../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../administration-by-user/users/user-components/entities/user-component-certificate.entity';
import { UserComponentReference } from '../administration-by-user/users/user-components/entities/user-component-reference.entity';

@Module({
  providers: [
    CacheService,
    CreateUserUseCase,
    GetEducationsUseCase,
    GetExperiencesUseCase,
    GetApplicationsUseCase,
    GetCertificatesUseCase,
    GetReferencesUseCase,
    GetTechnologiesUseCase,
    VerifyEmailCodeUseCase,
    GetApplicationDetailsUseCase,
    GetProfileWithAboutMeUseCase,
    SendEmailVerificationUseCase,
    CheckEmailAvailabilityUseCase,
    CheckUsernameAvailabilityUseCase,
  ],
  controllers: [
    PortfolioViewController,
  ],
  imports: [
    EmailModule,
    UsersModule,
    ConfigModule,
    MessagesModule,
    TypeOrmModule.forFeature([
      User,
      Technology,
      Application,
      EmailVerification,
      UserComponentAboutMe,
      UserComponentEducation,
      UserComponentExperience,
      UserComponentCertificate,
      UserComponentReference,
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class PortfolioViewModule { };
