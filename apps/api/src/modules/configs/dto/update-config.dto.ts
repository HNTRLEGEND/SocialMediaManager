import { IsIn, IsObject } from 'class-validator';

export class UpdateConfigDto {
  @IsIn(['n8n', 'elevenlabs'])
  type!: 'n8n' | 'elevenlabs';

  @IsObject()
  data!: Record<string, unknown>;
}
