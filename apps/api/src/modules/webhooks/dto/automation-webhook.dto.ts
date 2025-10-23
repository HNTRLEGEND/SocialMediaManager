import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class AutomationWebhookDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  workflowStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calls?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  voiceMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  csat?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
