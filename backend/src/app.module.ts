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
      host: 'database',
      type: 'postgres',
      entities: [Application, User],
      username: configService.get("POSTGRES_USER") || 'user',
      port: parseInt(configService.get("DB_DOCKER_PORT"), 10),
      database: configService.get("POSTGRES_DB") || 'portfolio_db',
      password: configService.get("POSTGRES_PASSWORD") || 'password',
      synchronize: configService.get("BACKEND_SYNCHRONIZE_DB") === 'true',
    }),
  ],
})
export class AppModule { };
