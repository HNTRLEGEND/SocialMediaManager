import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  async handleElevenLabs(event: Record<string, unknown>) {
    this.logger.log(`ElevenLabs webhook: ${JSON.stringify(event)}`);
    return { received: true };
  }

  async handleStripe(event: Record<string, unknown>) {
    this.logger.log(`Stripe webhook: ${JSON.stringify(event)}`);
    return { received: true };
  }
}
