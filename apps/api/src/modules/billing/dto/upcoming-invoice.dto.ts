import { IsString } from 'class-validator';

export class UpcomingInvoiceQueryDto {
  @IsString()
  customerId!: string;
}
