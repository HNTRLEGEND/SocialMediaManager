// ConfigsService: verwaltet n8n- und ElevenLabs-Konfigurationen inkl. Defaults.
import { Injectable } from '@nestjs/common';
import { ConfigType, IntegrationConfig, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  private defaultsFor(type: ConfigType): Record<string, unknown> {
    // Je nach Integration unterschiedliche Standardwerte
    if (type === ConfigType.N8N) {
      return {
        baseUrl: '',
        webhookUrl: '',
        tokens: [],
        parameters: {},
        automationCoverage: 0,
        status: 'inactive'
      };
    }

    return {
      voiceId: '',
      stability: 0.5,
      similarity: 0.5,
      style: 'balanced',
      apiKey: '',
      language: 'de-DE'
    };
  }

  private asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
    // Prisma JsonValue in Plain Object umwandeln
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private merge(type: ConfigType, value?: Record<string, unknown>): Record<string, unknown> {
    // Defaults mit bereits gespeicherten Werten kombinieren
    return { ...this.defaultsFor(type), ...(value ?? {}) };
  }

  private mapType(type: 'n8n' | 'elevenlabs'): ConfigType {
    // String aus dem Frontend in Prisma Enum umwandeln
    return type === 'n8n' ? ConfigType.N8N : ConfigType.ELEVENLABS;
  }

  async getConfig(type: ConfigType): Promise<IntegrationConfig & { data: Record<string, unknown> }> {
    // Konfiguration laden oder mit Defaults initialisieren
    const existing = await this.prisma.integrationConfig.findUnique({ where: { type } });

    if (!existing) {
      const defaults = this.defaultsFor(type);
      const created = await this.prisma.integrationConfig.create({
        data: {
          type,
          data: defaults
        }
      });
      return { ...created, data: defaults };
    }

    const merged = this.merge(type, this.asRecord(existing.data));
    return { ...existing, data: merged };
  }

  async update(dto: UpdateConfigDto): Promise<IntegrationConfig & { data: Record<string, unknown> }> {
    const type = this.mapType(dto.type);
    const data = this.merge(type, dto.data);

    // Upsert, damit sowohl erste Speicherung als auch Updates funktionieren
    const config = await this.prisma.integrationConfig.upsert({
      where: { type },
      create: { type, data },
      update: { data }
    });

    return { ...config, data };
  }
}
