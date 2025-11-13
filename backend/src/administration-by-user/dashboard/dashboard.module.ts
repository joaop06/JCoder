import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { DashboardController } from './dashboard.controller';
import { MessagesModule } from '../messages/messages.module';
import { Message } from '../messages/entities/message.entity';
import { CacheService } from '../../@common/services/cache.service';
import { Conversation } from '../messages/entities/conversation.entity';
import { ApplicationsModule } from '../applications/applications.module';
import { TechnologiesModule } from '../technologies/technologies.module';
import { PortfolioView } from '../../portfolio-view/entities/portfolio-view.entity';
import { GetApplicationsStatsUseCase } from './use-cases/get-applications-stats.use-case';
import { GetTechnologiesStatsUseCase } from './use-cases/get-technologies-stats.use-case';
import { GetProfileCompletenessUseCase } from './use-cases/get-profile-completeness.use-case';
import { GetUnreadMessagesStatsUseCase } from './use-cases/get-unread-messages-stats.use-case';
import { UserComponentAboutMe } from '../users/user-components/entities/user-component-about-me.entity';
import { GetPortfolioEngagementStatsUseCase } from './use-cases/get-portfolio-engagement-stats.use-case';
import { UserComponentEducation } from '../users/user-components/entities/user-component-education.entity';
import { UserComponentReference } from '../users/user-components/entities/user-component-reference.entity';
import { UserComponentExperience } from '../users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../users/user-components/entities/user-component-certificate.entity';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    ApplicationsModule,
    TechnologiesModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100,
    }),
    TypeOrmModule.forFeature([
      User,
      Message,
      Conversation,
      PortfolioView,
      UserComponentAboutMe,
      UserComponentEducation,
      UserComponentReference,
      UserComponentExperience,
      UserComponentCertificate,
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    CacheService,
    GetApplicationsStatsUseCase,
    GetTechnologiesStatsUseCase,
    GetUnreadMessagesStatsUseCase,
    GetProfileCompletenessUseCase,
    GetPortfolioEngagementStatsUseCase,
  ],
})
export class DashboardModule { }

