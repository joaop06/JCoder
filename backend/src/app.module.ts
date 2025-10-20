import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { loggerConfig } from './@common/config/logger.config';
import { ApplicationsModule } from './applications/applications.module';
import { ImagesModule } from './images/images.module';
import { TypeormMysqlModule } from './@common/database/typeorm-mysql-module';

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
    UsersModule,
    HealthModule,
    ImagesModule,
    ApplicationsModule,
    TypeormMysqlModule,
  ],
})
export class AppModule { };
