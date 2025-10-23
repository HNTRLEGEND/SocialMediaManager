import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  signToken(payload: { sub: string; tenantId: string; role: string }) {
    return this.jwt.sign(payload);
  }

  verifyToken(token: string) {
    return this.jwt.verify(token);
  }
}
