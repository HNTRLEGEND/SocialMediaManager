import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerAgentConfigService } from './services/customer-agent-config.service';
import { SheetMappingService } from './services/sheet-mapping.service';
import { ProductCatalogService } from './services/product-catalog.service';
import { AgentOrchestrationService } from './services/agent-orchestration.service';
import { ConfigController } from './controllers/config.controller';
import { WebhookController } from './controllers/webhook.controller';
import { OutboundController } from './controllers/outbound.controller';
import { N8nService } from './services/n8n.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { StatsController } from './controllers/stats.controller';
import { CustomerController } from './controllers/customer.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [ConfigController, WebhookController, HealthController, OutboundController, StatsController, CustomerController],
  providers: [
    PrismaService,
    CustomerAgentConfigService,
    SheetMappingService,
    ProductCatalogService,
    AgentOrchestrationService,
    N8nService,
    GoogleSheetsService,
  ],
  exports: [CustomerAgentConfigService, AgentOrchestrationService],
})
export class WiesLogicModule {}
