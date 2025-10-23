import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name!: string;

  @IsEnum(['VOICE', 'CHAT', 'BACKOFFICE'])
  type!: 'VOICE' | 'CHAT' | 'BACKOFFICE';

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  guardrails?: Record<string, unknown>;
}
