import { Body, Controller, Post } from '@nestjs/common';
import { AutomationWebhookDto } from './dto/automation-webhook.dto';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('n8n')
  n8n(@Body() body: AutomationWebhookDto) {
    return this.webhooksService.handleAutomation('n8n', body);
  }

  @Post('elevenlabs')
  elevenLabs(@Body() body: AutomationWebhookDto) {
    return this.webhooksService.handleAutomation('elevenlabs', body);
  }
}
