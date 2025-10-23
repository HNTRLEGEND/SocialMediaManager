import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe | null;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('stripe.secretKey');
    this.stripe = apiKey ? new Stripe(apiKey, { apiVersion: '2023-10-16' }) : null;
  }

  async upcomingInvoice(customerId: string) {
    if (!this.stripe) {
      return { total: 0, lines: [] };
    }

    const invoice = await this.stripe.invoices.retrieveUpcoming({ customer: customerId });
    return {
      total: invoice.total,
      currency: invoice.currency,
      lines: invoice.lines.data.map((line) => ({ description: line.description, amount: line.amount }))
    };
  }
}
