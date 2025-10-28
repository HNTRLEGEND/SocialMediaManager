import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('api/wieslogic/stats')
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':customerId')
  async getStats(
    @Param('customerId') customerId: string,
    @Query('days') days = '30',
  ) {
    const since = new Date();
    since.setDate(since.getDate() - Number(days || '30'));

    const [logs, config, catalog] = await Promise.all([
      this.prisma.agentExecutionLog.groupBy({
        by: ['agentName', 'status'],
        where: { customerId, createdAt: { gte: since } },
        _count: { _all: true },
      }).catch(() => [] as any[]),
      this.prisma.customerAgentConfig.findUnique({ where: { customerId } }).catch(() => null),
      this.prisma.productCatalogConfig.findMany({ where: { customerId } }).catch(() => []),
    ]);

    const executionSummary = logs.map((r: any) => ({
      agent: r.agentName,
      status: r.status,
      count: r._count?._all ?? r._count ?? 0,
    }));

    // Try to parse pricing JSON strings
    const catalogParsed = catalog.map((c) => ({
      category: c.category,
      enabled: c.enabled,
      models: safeParse(c.models),
      basePricing: safeParse(c.basePricing),
      discountRules: safeParse(c.discountRules),
    }));

    return {
      windowDays: Number(days || '30'),
      configSummary: config ? {
        leadAgentEnabled: config.leadAgentEnabled,
        techAgentEnabled: config.techAgentEnabled,
        salesAgentEnabled: config.salesAgentEnabled,
        serviceAgentEnabled: config.serviceAgentEnabled,
        paEnabled: (config as any).paEnabled ?? false,
      } : null,
      executionSummary,
      catalog: catalogParsed,
    };
  }
}

function safeParse(s?: string | null) {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return s; }
}

