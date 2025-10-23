// CreateCustomerDto: Validierung für eingehende Kunden- und Lead-Daten.
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  // Vollständiger Name der Kontaktperson
  name!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsEmail()
  // Geschäfts-E-Mail
  email!: string;

  @IsOptional()
  @IsString()
  // Optionaler Projekttyp (z. B. Voice Agent)
  projectType?: string;

  @IsOptional()
  @IsString()
  // Interessengebiet aus dem Formular
  interest?: string;

  @IsOptional()
  @IsString()
  // Status (lead, active, churned ...)
  status?: string;

  @IsOptional()
  @IsString()
  // Freitextnotizen
  notes?: string;

  @IsOptional()
  @IsString()
  // Quelle (website, referral ...)
  source?: string;

  @IsOptional()
  @IsObject()
  // Konfiguration des n8n-Workflows
  n8nConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  // Konfiguration für ElevenLabs Voice Agents
  elevenConfig?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  // Anzahl der Anrufe (für Reporting)
  callCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  // Verwendete Voice-Minuten
  voiceMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  // Automationsgrad in Prozent
  automationCoverage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  // Kundenzufriedenheit (Skala 1-5)
  csat?: number;

  @IsOptional()
  @IsString()
  // Status des Workflows (active, paused ...)
  workflowStatus?: string;
}
