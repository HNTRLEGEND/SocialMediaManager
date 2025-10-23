import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(tenantId: string, action: string, metadata: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        action,
        metadata
      }
    });
  }
}
