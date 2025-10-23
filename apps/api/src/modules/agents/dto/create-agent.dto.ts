import { AgentType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name!: string;

  @IsEnum(AgentType)
  type!: AgentType;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsObject()
  guardrails?: Record<string, unknown>;
}
