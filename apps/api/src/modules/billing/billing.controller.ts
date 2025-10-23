import { Controller, Get, Query } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('upcoming')
  upcoming(@Query('customerId') customerId: string) {
    return this.billing.upcomingInvoice(customerId);
  }
}
