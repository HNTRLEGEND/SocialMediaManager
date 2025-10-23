import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationWebhookDto } from './dto/automation-webhook.dto';

type WebhookSource = 'n8n' | 'elevenlabs';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateCustomerFromWebhook(customerId: string, payload: AutomationWebhookDto) {
    const data: Prisma.CustomerUpdateInput = {
      lastActivity: new Date()
    };

    if (payload.status) {
      data.status = payload.status;
    }

    if (payload.workflowStatus) {
      data.workflowStatus = payload.workflowStatus;
    }

    if (typeof payload.calls === 'number' && payload.calls > 0) {
      data.callCount = { increment: Math.round(payload.calls) };
    }

    if (typeof payload.voiceMinutes === 'number' && payload.voiceMinutes > 0) {
      data.voiceMinutes = { increment: Math.round(payload.voiceMinutes) };
    }

    if (typeof payload.csat === 'number') {
      data.csat = payload.csat;
    }

    const metadata = payload.metadata as Record<string, unknown> | undefined;

    if (metadata && typeof metadata.automationCoverage === 'number') {
      data.automationCoverage = metadata.automationCoverage;
    }

    try {
      await this.prisma.customer.update({ where: { id: customerId }, data });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Customer ${customerId} not found`);
      }
      throw error;
    }
  }

  async handleAutomation(source: WebhookSource, payload: AutomationWebhookDto) {
    const metadata = payload.metadata as Record<string, unknown> | undefined;

    const logPayload: Record<string, unknown> = {
      status: payload.status,
      workflowStatus: payload.workflowStatus,
      calls: payload.calls,
      voiceMinutes: payload.voiceMinutes,
      csat: payload.csat,
      metadata: metadata ?? {}
    };

    if (payload.customerId) {
      logPayload.customerId = payload.customerId;
    }

    const message =
      typeof metadata?.message === 'string'
        ? (metadata.message as string)
        : payload.workflowStatus
        ? `Workflow Status: ${payload.workflowStatus}`
        : undefined;

    const log = await this.prisma.webhookLog.create({
      data: {
        source,
        customerId: payload.customerId ?? null,
        payload: logPayload,
        message
      }
    });

    if (payload.customerId) {
      await this.updateCustomerFromWebhook(payload.customerId, payload);
    }

    return { ok: true, id: log.id };
  }
}
