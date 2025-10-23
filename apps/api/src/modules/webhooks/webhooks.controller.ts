import { Body, Controller, Headers, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('eleven/call.started')
  callStarted(@Body() body: Record<string, unknown>) {
    return this.webhooks.handleElevenLabs(body);
  }

  @Post('eleven/call.ended')
  callEnded(@Body() body: Record<string, unknown>) {
    return this.webhooks.handleElevenLabs(body);
  }

  @Post('eleven/transcript.ready')
  transcriptReady(@Body() body: Record<string, unknown>) {
    return this.webhooks.handleElevenLabs(body);
  }

  @Post('stripe')
  stripe(@Body() body: Record<string, unknown>, @Headers('stripe-signature') signature: string) {
    return this.webhooks.handleStripe({ ...body, signature });
  }
}
