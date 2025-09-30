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
      port: 3306,
      type: 'mysql',
      host: 'database',
      entities: [Application, User],
      username: configService.get("DATABASE_USER"),
      database: configService.get("DATABASE_NAME"),
      password: configService.get("DATABASE_PASSWORD"),
      synchronize: configService.get("BACKEND_SYNCHRONIZE_DATABASE") === 'true',
    }),
  ],
})
export class AppModule { };
