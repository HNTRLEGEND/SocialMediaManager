import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    const [agents, projects, runs] = await Promise.all([
      this.prisma.agent.count({ where: { tenantId } }),
      this.prisma.project.count({ where: { tenantId } }),
      this.prisma.agentRun.aggregate({
        where: { tenantId },
        _sum: { cost: true, durationSeconds: true }
      })
    ]);

    return {
      agents,
      projects,
      totalCost: runs._sum.cost ?? 0,
      durationSeconds: runs._sum.durationSeconds ?? 0
    };
  }
}
