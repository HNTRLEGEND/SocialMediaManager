import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string | undefined;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant scope required');
    }

    request.tenantId = tenantId;
    return true;
  }
}
