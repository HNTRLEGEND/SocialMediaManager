// WebhooksModule: verarbeitet externe Events und protokolliert sie.
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService]
})
export class WebhooksModule {}
