import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { loggerConfig } from './@common/config/logger.config';
import { AuthModule } from './administration-by-user/auth/auth.module';
import { UsersModule } from './administration-by-user/users/users.module';
import { ImagesModule } from './administration-by-user/images/images.module';
import { PortfolioViewModule } from './portfolio-view/portfolio-view.module';
import { TypeormMysqlModule } from './@common/database/typeorm-mysql-module';
import { MessagesModule } from './administration-by-user/messages/messages.module';
import { ApplicationsModule } from './administration-by-user/applications/applications.module';
import { TechnologiesModule } from './administration-by-user/technologies/technologies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
    ]),
    AuthModule,
    EmailModule,
    UsersModule,
    HealthModule,
    ImagesModule,
    MessagesModule,
    ApplicationsModule,
    TechnologiesModule,
    TypeormMysqlModule,
    PortfolioViewModule,
  ],
})
export class AppModule { };
