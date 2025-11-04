import { config } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { JwtStrategy } from '../@common/strategies/jwt.strategy';

config();
const configService = new ConfigService();

@Module({
  controllers: [AuthController],
  providers: [JwtStrategy, SignInUseCase],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      signOptions: { expiresIn: '60m' },
      secret: configService.get("BACKEND_JWT_SECRET") || 'default-secret',
    }),
  ],
})
export class AuthModule { };
