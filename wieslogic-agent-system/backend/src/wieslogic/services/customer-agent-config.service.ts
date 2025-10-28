import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateCustomerAgentConfigDto {
  googleSheetId: string;
  driveFolderId?: string;
  serviceAccountEmail: string;
  leadAgentEnabled?: boolean;
  techAgentEnabled?: boolean;
  salesAgentEnabled?: boolean;
  serviceAgentEnabled?: boolean;
  licenseType: string;
  activationDate: Date;
  expirationDate?: Date;
  webhookBaseUrl: string;
  openAIApiKey: string;
  vectorStoreId?: string;
  ragEnabled?: boolean;
  companyName: string;
  fromEmail: string;
  replyToEmail: string;
  logoUrl?: string;
  minBudgetEur?: number;
  minBantScore?: number;
  autoQualifyScore?: number;
}

@Injectable()
export class CustomerAgentConfigService {
  constructor(private prisma: PrismaService) {}

  private generateWebhookToken(): string {
    return `wl_${Math.random().toString(36).slice(2)}${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  async createConfig(customerId: string, dto: CreateCustomerAgentConfigDto) {
    return this.prisma.customerAgentConfig.create({
      data: {
        customerId,
        ...dto,
        webhookToken: this.generateWebhookToken(),
        status: 'active',
      },
    });
  }

  async getConfig(customerId: string) {
    const config = await this.prisma.customerAgentConfig.findUnique({
      where: { customerId },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuration not found for customer: ${customerId}`,
      );
    }

    return config;
  }

  async updateConfig(
    customerId: string,
    updates: Partial<CreateCustomerAgentConfigDto>,
  ) {
    return this.prisma.customerAgentConfig.update({
      where: { customerId },
      data: updates,
    });
  }

  async getActiveAgents(customerId: string) {
    const config = await this.getConfig(customerId);
    const activeAgents: string[] = [];
    if (config.leadAgentEnabled) activeAgents.push('lead_agent');
    if (config.techAgentEnabled) activeAgents.push('technical_agent');
    if (config.salesAgentEnabled) activeAgents.push('sales_agent');
    if (config.serviceAgentEnabled) activeAgents.push('service_agent');
    if ((config as any).masterAgentEnabled) activeAgents.push('master_agent');
    if ((config as any).leadGeneratorEnabled) activeAgents.push('lead_generator');
    if ((config as any).contentAgentEnabled) activeAgents.push('content_agent');
    if ((config as any).marketingAgentEnabled) activeAgents.push('marketing_agent');
    return activeAgents;
  }

  async isAgentEnabled(customerId: string, agentName: string): Promise<boolean> {
    const config = await this.getConfig(customerId);
    const agentMap: Record<string, boolean> = {
      lead_agent: config.leadAgentEnabled,
      technical_agent: config.techAgentEnabled,
      sales_agent: config.salesAgentEnabled,
      service_agent: config.serviceAgentEnabled,
      master_agent: (config as any).masterAgentEnabled ?? true,
      lead_generator: (config as any).leadGeneratorEnabled ?? false,
      content_agent: (config as any).contentAgentEnabled ?? false,
      marketing_agent: (config as any).marketingAgentEnabled ?? false,
    };
    return agentMap[agentName] ?? false;
  }

  async updateHealthCheck(customerId: string) {
    return this.prisma.customerAgentConfig.update({
      where: { customerId },
      data: { lastHealthCheck: new Date() },
    });
  }
}
