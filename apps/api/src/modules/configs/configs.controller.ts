// ConfigsController: stellt Endpunkte für Integrationskonfigurationen bereit.
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigType } from '@prisma/client';
import { ConfigsService } from './configs.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('config')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get('n8n')
  // Aktuelle n8n Konfiguration laden
  getN8n() {
    return this.configsService.getConfig(ConfigType.N8N);
  }

  @Get('elevenlabs')
  // ElevenLabs Konfiguration abrufen
  getElevenLabs() {
    return this.configsService.getConfig(ConfigType.ELEVENLABS);
  }

  @Post('update')
  // Konfiguration speichern oder aktualisieren
  update(@Body() body: UpdateConfigDto) {
    return this.configsService.update(body);
  }
}
