import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

config();
const configService = new ConfigService();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get("BACKEND_JWT_SECRET") || 'default-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt
    };
  }
};
