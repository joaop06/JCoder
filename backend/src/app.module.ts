import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { TypeormMysqlModule } from './@common/database/typeorm-mysql-module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ApplicationsModule,
    TypeormMysqlModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule { };
