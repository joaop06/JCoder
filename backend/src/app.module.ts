import { config } from 'dotenv';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplicationsModule } from './applications/applications.module';
import { Application } from './applications/entities/application.entity';

config();
const configService = new ConfigService();

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      entities: [Application, User],
      username: configService.get("DATABASE_USER"),
      database: configService.get("DATABASE_NAME"),
      host: configService.get("BACKEND_DATABASE_HOST"),
      password: configService.get("DATABASE_PASSWORD"),
      port: parseInt(configService.get("BACKEND_DATABASE_PORT")),
      synchronize: configService.get("BACKEND_SYNCHRONIZE_DATABASE") === 'true',
    }),
  ],
})
export class AppModule { };
