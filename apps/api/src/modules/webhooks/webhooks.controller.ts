// WebhooksController: nimmt Ereignisse von n8n und ElevenLabs entgegen.
import { Body, Controller, Post } from '@nestjs/common';
import { AutomationWebhookDto } from './dto/automation-webhook.dto';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('n8n')
  // n8n Automationsereignis verarbeiten
  n8n(@Body() body: AutomationWebhookDto) {
    return this.webhooksService.handleAutomation('n8n', body);
  }

  @Post('elevenlabs')
  // ElevenLabs Ereignis entgegennehmen (z. B. Call abgeschlossen)
  elevenLabs(@Body() body: AutomationWebhookDto) {
    return this.webhooksService.handleAutomation('elevenlabs', body);
  }
}
