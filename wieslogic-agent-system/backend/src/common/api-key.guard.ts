import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const expected = process.env.BACKEND_TOKEN;
    if (!expected) return true; // no token configured => allow

    const header: string | undefined = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || typeof header !== 'string') throw new UnauthorizedException('Missing Authorization header');

    const token = header.startsWith('Bearer ')? header.slice(7) : header;
    if (token !== expected) throw new UnauthorizedException('Invalid token');
    return true;
  }
}

