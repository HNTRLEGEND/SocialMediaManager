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
  name!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  interest?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsObject()
  n8nConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  elevenConfig?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  callCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  voiceMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  automationCoverage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  csat?: number;

  @IsOptional()
  @IsString()
  workflowStatus?: string;
}
