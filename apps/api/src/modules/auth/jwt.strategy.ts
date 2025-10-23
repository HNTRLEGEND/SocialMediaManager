import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('clerk.secretKey') ?? 'dev-secret'
    });
  }

  validate(payload: { sub: string; tenantId: string; role: string }) {
    return { userId: payload.sub, tenantId: payload.tenantId, role: payload.role };
  }
}
