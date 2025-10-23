// MetricsService: berechnet Kennzahlen und formatiert Aktivitätslogs für das Dashboard.
import { Injectable } from '@nestjs/common';
import { Prisma, WebhookLog } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface ActivitySummary {
  id: string;
  source: string;
  message: string;
  createdAt: Date;
  customer?: {
    id: string;
    name: string;
    company: string;
  } | null;
}

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  private asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
    // Hilfsfunktion um JSON Felder in ein Objekt zu transformieren
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private buildMessage(log: WebhookLog & { payload: Prisma.JsonValue }): string {
    // Erstellt menschenlesbare Aktivitätsnachrichten aus dem Payload
    if (log.message) {
      return log.message;
    }

    const payload = this.asRecord(log.payload);
    const parts: string[] = [];

    if (typeof payload.workflowStatus === 'string') {
      parts.push(`Workflow ${payload.workflowStatus}`);
    }
    if (typeof payload.status === 'string') {
      parts.push(payload.status);
    }
    if (typeof payload.calls === 'number') {
      parts.push(`${payload.calls} Calls`);
    }
    if (typeof payload.voiceMinutes === 'number') {
      parts.push(`${payload.voiceMinutes} Voice-Minuten`);
    }

    if (parts.length === 0) {
      return `${log.source} Event erfasst`;
    }

    return `${log.source.toUpperCase()}: ${parts.join(' · ')}`;
  }

  async getOverview() {
    const customers = await this.prisma.customer.findMany();
    const totalCalls = customers.reduce((sum, customer) => sum + customer.callCount, 0);
    const totalVoiceMinutes = customers.reduce((sum, customer) => sum + customer.voiceMinutes, 0);
    const automationCoverage = customers.length
      ? customers.reduce((sum, customer) => sum + customer.automationCoverage, 0) / customers.length
      : 0;
    const csat = customers.length ? customers.reduce((sum, customer) => sum + customer.csat, 0) / customers.length : 0;
    const leadCount = customers.filter((customer) => customer.status === 'lead').length;
    const activeWorkflows = customers.filter((customer) => customer.workflowStatus === 'active').length;

    return {
      customers: customers.length,
      totalCalls,
      totalVoiceMinutes,
      automationCoverage: Number(automationCoverage.toFixed(1)),
      csat: Number(csat.toFixed(2)),
      leadCount,
      activeWorkflows
    };
  }

  async getActivity(limit = 20): Promise<ActivitySummary[]> {
    const entries = await this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: true
      }
    });

    return entries.map((entry) => ({
      id: entry.id,
      source: entry.source,
      message: this.buildMessage(entry),
      createdAt: entry.createdAt,
      customer: entry.customer
        ? {
            id: entry.customer.id,
            name: entry.customer.name,
            company: entry.customer.company
          }
        : null
    }));
  }
}
