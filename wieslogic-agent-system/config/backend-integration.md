# WiesLogic Agent System - Backend Integration Guide

## Overview
This document describes how to integrate the WiesLogic Agent System with the existing WIES.AI NestJS backend for multi-customer configuration management.

## Architecture

```
WIES.AI Backend (NestJS)
├── Customer Module
│   ├── Customer CRUD
│   └── Customer Configuration
├── WiesLogic Module (NEW)
│   ├── Agent Configuration
│   ├── Sheet Mapping
│   ├── Product Catalog
│   └── Webhook Management
└── n8n Workflows
    ├── Master Controller
    ├── Lead Agent
    ├── Technical Agent
    └── Sales Agent
```

## Database Schema Extensions

### Customer Configuration Table

```prisma
model CustomerAgentConfig {
  id                 String   @id @default(cuid())
  customerId         String   @unique

  // Google Integration
  googleSheetId      String
  driveFolderId      String?
  serviceAccountEmail String

  // Agent Activation
  leadAgentEnabled   Boolean  @default(true)
  techAgentEnabled   Boolean  @default(true)
  salesAgentEnabled  Boolean  @default(true)
  serviceAgentEnabled Boolean @default(false)

  // License Information
  licenseType        String   // 'full', 'trial', 'limited'
  activationDate     DateTime
  expirationDate     DateTime?

  // Webhook Configuration
  webhookToken       String   @unique
  webhookBaseUrl     String

  // AI Configuration
  openAIApiKey       String   @db.Text
  vectorStoreId      String?
  ragEnabled         Boolean  @default(true)

  // Branding
  companyName        String
  fromEmail          String
  replyToEmail       String
  logoUrl            String?

  // Business Rules
  minBudgetEur       Int      @default(10000)
  minBantScore       Int      @default(60)
  autoQualifyScore   Int      @default(85)

  // Status
  status             String   // 'active', 'suspended', 'expired'
  lastHealthCheck    DateTime?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  customer           Customer @relation(fields: [customerId], references: [id])

  @@index([customerId])
  @@index([status])
}

model ProductCatalogConfig {
  id                 String   @id @default(cuid())
  customerId         String

  category           String   // 'pallet_wrappers', 'palletizers', etc.
  enabled            Boolean  @default(true)
  models             Json     // Array of model names
  calculationModule  String   // Calculator class name

  // Pricing
  basePricing        Json?    // Base price configuration
  discountRules      Json?    // Discount rules

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@unique([customerId, category])
  @@index([customerId])
}

model SheetMapping {
  id                 String   @id @default(cuid())
  customerId         String

  logicalName        String   // 'inquiries', 'quotations', etc.
  actualSheetName    String   // '01_📋Inquiries_Log'

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@unique([customerId, logicalName])
  @@index([customerId])
}

model AgentExecutionLog {
  id                 String   @id @default(cuid())
  customerId         String

  agentName          String   // 'lead_agent', 'technical_agent', etc.
  inquiryId          String?

  startTime          DateTime
  endTime            DateTime?
  duration           Int?     // milliseconds

  status             String   // 'success', 'error', 'timeout'
  errorMessage       String?  @db.Text

  inputData          Json?
  outputData         Json?

  createdAt          DateTime @default(now())

  @@index([customerId, agentName])
  @@index([status])
  @@index([createdAt])
}
```

## NestJS Module Implementation

### 1. WiesLogic Module Structure

```typescript
// apps/api/src/wieslogic/wieslogic.module.ts

import { Module } from '@nestjs/common';
import { CustomerAgentConfigService } from './services/customer-agent-config.service';
import { ProductCatalogService } from './services/product-catalog.service';
import { SheetMappingService } from './services/sheet-mapping.service';
import { AgentOrchestrationService } from './services/agent-orchestration.service';
import { WebhookController } from './controllers/webhook.controller';
import { ConfigController } from './controllers/config.controller';

@Module({
  imports: [],
  controllers: [WebhookController, ConfigController],
  providers: [
    CustomerAgentConfigService,
    ProductCatalogService,
    SheetMappingService,
    AgentOrchestrationService,
  ],
  exports: [
    CustomerAgentConfigService,
    AgentOrchestrationService,
  ],
})
export class WiesLogicModule {}
```

### 2. Customer Agent Configuration Service

```typescript
// apps/api/src/wieslogic/services/customer-agent-config.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerAgentConfigDto } from '../dto/create-customer-agent-config.dto';

@Injectable()
export class CustomerAgentConfigService {
  constructor(private prisma: PrismaService) {}

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
      throw new NotFoundException(`Configuration not found for customer: ${customerId}`);
    }

    return config;
  }

  async updateConfig(customerId: string, updates: Partial<CreateCustomerAgentConfigDto>) {
    return this.prisma.customerAgentConfig.update({
      where: { customerId },
      data: updates,
    });
  }

  async getActiveAgents(customerId: string) {
    const config = await this.getConfig(customerId);

    const activeAgents = [];
    if (config.leadAgentEnabled) activeAgents.push('lead_agent');
    if (config.techAgentEnabled) activeAgents.push('technical_agent');
    if (config.salesAgentEnabled) activeAgents.push('sales_agent');
    if (config.serviceAgentEnabled) activeAgents.push('service_agent');

    return activeAgents;
  }

  async isAgentEnabled(customerId: string, agentName: string): Promise<boolean> {
    const config = await this.getConfig(customerId);

    const agentMap = {
      'lead_agent': config.leadAgentEnabled,
      'technical_agent': config.techAgentEnabled,
      'sales_agent': config.salesAgentEnabled,
      'service_agent': config.serviceAgentEnabled,
    };

    return agentMap[agentName] || false;
  }

  async updateHealthCheck(customerId: string) {
    return this.prisma.customerAgentConfig.update({
      where: { customerId },
      data: { lastHealthCheck: new Date() },
    });
  }

  private generateWebhookToken(): string {
    return `wl_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
}
```

### 3. Sheet Mapping Service

```typescript
// apps/api/src/wieslogic/services/sheet-mapping.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SheetMappingService {
  private readonly DEFAULT_MAPPINGS = {
    inquiries: '01_📋Inquiries_Log',
    quotations: '02💰Quotation_Options',
    customer_profile: '03🔍Customer_Profile',
    reports: '04📑Reports',
    service_log: '05📑Service_Log',
    product_portfolio: '06📦Product_Portfolio',
    mechanical_specs: '07⚙️Mechanical_Specs',
    electrical_specs: '08🔌Electrical_Specs',
    packaging_specs: '09🎞️Packaging_Process_Specs',
    marketing_log: '10📑Marketing_Activity_Log',
    chart_data: '12_📈Chart_Data',
    master_log: '13📑Master_Log',
    performance_log: '14🔍Performance_Log',
    health_log: '15🔍System_Health_Log',
    evaluation_log: '16_Evaluation_Log',
    client_config: '17🔍Client_Config',
    lead_intelligence: '19🔍_Lead_Intelligence_Log',
  };

  constructor(private prisma: PrismaService) {}

  async initializeDefaultMappings(customerId: string) {
    const mappings = Object.entries(this.DEFAULT_MAPPINGS).map(([logical, actual]) => ({
      customerId,
      logicalName: logical,
      actualSheetName: actual,
    }));

    return this.prisma.sheetMapping.createMany({
      data: mappings,
      skipDuplicates: true,
    });
  }

  async getSheetName(customerId: string, logicalName: string): Promise<string> {
    const mapping = await this.prisma.sheetMapping.findUnique({
      where: {
        customerId_logicalName: {
          customerId,
          logicalName,
        },
      },
    });

    return mapping?.actualSheetName || this.DEFAULT_MAPPINGS[logicalName];
  }

  async getAllMappings(customerId: string) {
    const mappings = await this.prisma.sheetMapping.findMany({
      where: { customerId },
    });

    const result: Record<string, string> = {};
    mappings.forEach(m => {
      result[m.logicalName] = m.actualSheetName;
    });

    return result;
  }

  async updateMapping(customerId: string, logicalName: string, actualSheetName: string) {
    return this.prisma.sheetMapping.upsert({
      where: {
        customerId_logicalName: {
          customerId,
          logicalName,
        },
      },
      update: { actualSheetName },
      create: {
        customerId,
        logicalName,
        actualSheetName,
      },
    });
  }
}
```

### 4. Agent Orchestration Service

```typescript
// apps/api/src/wieslogic/services/agent-orchestration.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CustomerAgentConfigService } from './customer-agent-config.service';
import { SheetMappingService } from './sheet-mapping.service';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AgentOrchestrationService {
  constructor(
    private configService: CustomerAgentConfigService,
    private sheetMappingService: SheetMappingService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async triggerLeadAgent(customerId: string, leadData: any) {
    const startTime = new Date();

    try {
      // Check if lead agent is enabled
      const isEnabled = await this.configService.isAgentEnabled(customerId, 'lead_agent');
      if (!isEnabled) {
        throw new BadRequestException('Lead agent is not enabled for this customer');
      }

      // Get configuration
      const config = await this.configService.getConfig(customerId);
      const sheetMappings = await this.sheetMappingService.getAllMappings(customerId);

      // Prepare payload
      const payload = {
        customer_id: customerId,
        sheet_id: config.googleSheetId,
        sheet_mappings: sheetMappings,
        lead_data: leadData,
        config: {
          min_bant_score: config.minBantScore,
          auto_qualify_threshold: config.autoQualifyScore,
        },
      };

      // Call n8n webhook
      const n8nUrl = `${config.webhookBaseUrl}/lead`;
      const response = await firstValueFrom(
        this.httpService.post(n8nUrl, payload, {
          headers: {
            'Authorization': `Bearer ${config.webhookToken}`,
          },
        })
      );

      // Log execution
      await this.logExecution({
        customerId,
        agentName: 'lead_agent',
        startTime,
        endTime: new Date(),
        status: 'success',
        inputData: payload,
        outputData: response.data,
      });

      return response.data;
    } catch (error) {
      // Log error
      await this.logExecution({
        customerId,
        agentName: 'lead_agent',
        startTime,
        endTime: new Date(),
        status: 'error',
        errorMessage: error.message,
        inputData: leadData,
      });

      throw error;
    }
  }

  async getNextAgent(customerId: string, currentAgent: string) {
    const activeAgents = await this.configService.getActiveAgents(customerId);

    const agentFlow = {
      'lead_agent': 'technical_agent',
      'technical_agent': 'sales_agent',
      'sales_agent': 'service_agent',
      'service_agent': null,
    };

    let nextAgent = agentFlow[currentAgent];

    // Skip disabled agents
    while (nextAgent && !activeAgents.includes(nextAgent)) {
      nextAgent = agentFlow[nextAgent];
    }

    return nextAgent;
  }

  private async logExecution(logData: {
    customerId: string;
    agentName: string;
    startTime: Date;
    endTime: Date;
    status: string;
    errorMessage?: string;
    inputData?: any;
    outputData?: any;
    inquiryId?: string;
  }) {
    const duration = logData.endTime.getTime() - logData.startTime.getTime();

    return this.prisma.agentExecutionLog.create({
      data: {
        ...logData,
        duration,
      },
    });
  }
}
```

### 5. Webhook Controller

```typescript
// apps/api/src/wieslogic/controllers/webhook.controller.ts

import { Controller, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { AgentOrchestrationService } from '../services/agent-orchestration.service';
import { CustomerAgentConfigService } from '../services/customer-agent-config.service';

@Controller('wieslogic/webhooks')
export class WebhookController {
  constructor(
    private orchestrationService: AgentOrchestrationService,
    private configService: CustomerAgentConfigService,
  ) {}

  @Post(':customerId/lead')
  async handleLeadWebhook(
    @Param('customerId') customerId: string,
    @Headers('authorization') authHeader: string,
    @Body() leadData: any,
  ) {
    await this.validateWebhookAuth(customerId, authHeader);
    return this.orchestrationService.triggerLeadAgent(customerId, leadData);
  }

  private async validateWebhookAuth(customerId: string, authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const config = await this.configService.getConfig(customerId);

    if (config.webhookToken !== token) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    if (config.status !== 'active') {
      throw new UnauthorizedException('Customer account is not active');
    }
  }
}
```

## Deployment Workflow

1. **Database Migration**
   ```bash
   # Add schema to apps/api/prisma/schema.prisma
   pnpm --filter api prisma migrate dev --name add_wieslogic_tables
   ```

2. **Create Customer Configuration**
   ```bash
   POST /api/wieslogic/config/:customerId
   ```

3. **Initialize Sheet Mappings**
   ```bash
   POST /api/wieslogic/config/:customerId/initialize-sheets
   ```

4. **Deploy n8n Workflows**
   - Import workflows to n8n instance
   - Configure webhook URLs
   - Set environment variables

5. **Test Integration**
   ```bash
   POST /api/wieslogic/webhooks/:customerId/lead
   ```

## Environment Variables

Add to `apps/api/.env`:

```env
# WiesLogic Configuration
N8N_BASE_URL=https://n8n.wies.ai
N8N_API_KEY=your_n8n_api_key

# Default OpenAI Settings
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo

# Hunter.io
HUNTER_API_KEY=your_hunter_key
```

## Next Steps

1. ✅ Create Prisma schema
2. ✅ Implement services
3. ✅ Create controllers
4. ✅ Add authentication
5. ⏳ Create admin UI for configuration
6. ⏳ Build monitoring dashboard
7. ⏳ Implement health checks
8. ⏳ Add automated testing
