// AutomationWebhookDto: Validierung für eingehende Automationsereignisse.
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class AutomationWebhookDto {
  @IsOptional()
  @IsString()
  // Zugehöriger Kunde
  customerId?: string;

  @IsOptional()
  @IsString()
  // Statusnachricht (z. B. success)
  status?: string;

  @IsOptional()
  @IsString()
  // Workflow Status (active, failed ...)
  workflowStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  // Anzahl Calls aus dem Event
  calls?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  // Voice-Minuten aus dem Event
  voiceMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  // Kundenzufriedenheit des Events
  csat?: number;

  @IsOptional()
  @IsObject()
  // Freie Zusatzinformationen
  metadata?: Record<string, unknown>;
}
