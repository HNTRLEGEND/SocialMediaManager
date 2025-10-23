// UpdateConfigDto: validiert Konfigurationsupdates aus dem Dashboard.
import { IsIn, IsObject } from 'class-validator';

export class UpdateConfigDto {
  @IsIn(['n8n', 'elevenlabs'])
  // Zielintegration identifizieren
  type!: 'n8n' | 'elevenlabs';

  @IsObject()
  // Frei strukturierte Konfigurationsdaten
  data!: Record<string, unknown>;
}
