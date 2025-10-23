import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId as string | undefined;
    const userId = request.user?.id ?? 'system';

    const start = Date.now();

    return next.handle().pipe(
      tap(async () => {
        if (!tenantId) return;
        const duration = Date.now() - start;
        await this.prisma.auditLog.create({
          data: {
            tenantId,
            actorId: userId,
            action: `${request.method} ${request.path}`,
            metadata: { duration }
          }
        });
      })
    );
  }
}
