import { Controller, Get, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { UpcomingInvoiceQueryDto } from './dto/upcoming-invoice.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('upcoming')
  upcoming(@Query() query: UpcomingInvoiceQueryDto) {
    return this.billing.upcomingInvoice(query.customerId);
  }
}
