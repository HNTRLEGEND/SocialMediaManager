import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/api-key.guard';
import { N8nService } from '../services/n8n.service';

@UseGuards(ApiKeyGuard)
@Controller('api/wieslogic/test')
export class OutboundController {
  constructor(private readonly n8n: N8nService) {}

  // Simple outbound test to n8n Lead Agent
  @Post('lead')
  @HttpCode(202)
  async testLead(@Body() body: any) {
    const payload = body && Object.keys(body).length
      ? body
      : {
          customer_id: 'ROBOPAC_AETNA_001',
          data: {
            company_name: 'Test GmbH',
            email: 'test@example.com',
            product_interest: 'pallet_wrapper',
          },
        };

    const result = await this.n8n.triggerLeadAgent(payload);
    const urlBase = process.env.N8N_BASE_URL?.replace(/\/$/,'');
    const path = process.env.N8N_LEAD_WEBHOOK_PATH || 'lead-agent';
    const usedUrl = result.status >= 200 && result.status < 300
      ? `${urlBase}/webhook/${path}`
      : `${urlBase}/webhook-test/${path}`;
    return {
      forwarded: result.status >= 200 && result.status < 300,
      url: usedUrl,
      status: result.status,
      data: result.data,
    };
  }

  // Convenience: GET route for browser testing (uses default payload)
  @Get('lead')
  @HttpCode(202)
  async testLeadGet() {
    const payload = {
      customer_id: 'ROBOPAC_AETNA_001',
      data: {
        company_name: 'Test GmbH',
        email: 'test@example.com',
        product_interest: 'pallet_wrapper',
      },
    };
    const result = await this.n8n.triggerLeadAgent(payload);
    const urlBase = process.env.N8N_BASE_URL?.replace(/\/$/,'');
    const path = process.env.N8N_LEAD_WEBHOOK_PATH || 'lead-agent';
    const usedUrl = result.status >= 200 && result.status < 300
      ? `${urlBase}/webhook/${path}`
      : `${urlBase}/webhook-test/${path}`;
    return {
      forwarded: result.status >= 200 && result.status < 300,
      url: usedUrl,
      status: result.status,
      data: result.data,
    };
  }

  // Master trigger
  @Post('master')
  @HttpCode(202)
  async testMaster(@Body() body: any) {
    const payload = body && Object.keys(body).length ? body : {
      action: 'trigger_lead_agent',
      customer_id: 'ROBOPAC_AETNA_001',
      data: {
        company_name: 'Test GmbH',
        email: 'test@example.com',
        product_interest: 'pallet_wrapper'
      }
    };
    const result = await this.n8n.triggerMaster(payload);
    const urlBase = process.env.N8N_BASE_URL?.replace(/\/$/,'');
    const path = process.env.N8N_MASTER_WEBHOOK_PATH || 'wieslogic-master';
    const usedUrl = result.status >= 200 && result.status < 300
      ? (process.env.N8N_MASTER_WEBHOOK_URL || `${urlBase}/webhook/${path}`)
      : `${urlBase}/webhook-test/${path}`;
    return {
      forwarded: result.status >= 200 && result.status < 300,
      url: usedUrl,
      status: result.status,
      data: result.data,
    };
  }
}
