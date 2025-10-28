import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AgentOrchestrationService } from '../services/agent-orchestration.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('api/wieslogic/webhooks')
export class WebhookController {
  constructor(private readonly orchestration: AgentOrchestrationService) {}

  // Example webhook entry to trigger lead agent via backend (normally forwarded to n8n)
  @Post(':customerId/lead')
  @HttpCode(202)
  async triggerLead(@Param('customerId') customerId: string, @Body() payload: any) {
    const runtime = await this.orchestration.getRuntimeContext(customerId);
    return {
      accepted: true,
      customerId,
      context: {
        activeAgents: runtime.activeAgents,
        sheetMappings: runtime.sheets,
      },
      data: payload,
      note: 'Forward to n8n MASTER controller webhook in production.',
    };
  }
}
