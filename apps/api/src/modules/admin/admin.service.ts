import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  tenants() {
    return this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        tenantId: true,
        projects: { select: { id: true } },
        agents: { select: { id: true } }
      }
    });
  }
}
