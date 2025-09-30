import { config } from 'dotenv';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { User } from './auth/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplicationsModule } from './applications/applications.module';
import { Application } from './applications/entities/application.entity';

config();
const configService = new ConfigService();

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [
    AuthModule,
    ApplicationsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'database',
      entities: [Application, User],
      username: configService.get("DB_DOCKER_USER"),
      database: configService.get("DB_DOCKER_DB_NAME"),
      password: configService.get("DB_DOCKER_PASSWORD"),
      port: parseInt(configService.get("DB_DOCKER_PORT"), 10),
      synchronize: configService.get("BACKEND_SYNCHRONIZE_DB") === 'true',
    }),
  ],
})
export class AppModule { };
