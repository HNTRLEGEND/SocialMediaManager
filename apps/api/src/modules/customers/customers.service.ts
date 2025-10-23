// CustomersService: Datenzugriffsschicht für Kund:innen inklusive Default-Konfigurationen.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, Prisma as PrismaClient } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private defaultN8nConfig(): Record<string, unknown> {
    // Standardwerte, falls kein n8n Setup vorhanden ist
    return {
      webhookUrl: '',
      parameters: {},
      tokens: [],
      automationCoverage: 0,
      status: 'inactive'
    };
  }

  private defaultElevenConfig(): Record<string, unknown> {
    // Grundkonfiguration für ElevenLabs Agenten
    return {
      voiceId: '',
      stability: 0.5,
      similarity: 0.5,
      style: 'balanced',
      apiKeyStatus: 'pending'
    };
  }

  private mergeConfig(
    defaults: Record<string, unknown>,
    incoming?: Record<string, unknown> | null
  ): PrismaClient.InputJsonValue {
    // Vereinigt vorhandene Werte mit Defaults, ohne Felder zu verlieren
    return { ...defaults, ...(incoming ?? {}) };
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Beim Anlegen werden Default-Konfigurationen ergänzt
    const data: PrismaClient.CustomerCreateInput = {
      name: dto.name,
      company: dto.company,
      email: dto.email,
      projectType: dto.projectType ?? null,
      interest: dto.interest ?? null,
      status: dto.status ?? 'lead',
      notes: dto.notes ?? null,
      source: dto.source ?? 'website',
      callCount: dto.callCount ?? 0,
      voiceMinutes: dto.voiceMinutes ?? 0,
      automationCoverage: dto.automationCoverage ?? 0,
      csat: dto.csat ?? 4.6,
      workflowStatus: dto.workflowStatus ?? 'inactive',
      n8nConfig: this.mergeConfig(this.defaultN8nConfig(), dto.n8nConfig),
      elevenConfig: this.mergeConfig(this.defaultElevenConfig(), dto.elevenConfig)
    };

    return this.prisma.customer.create({ data });
  }

  findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    try {
      // Nur übergebene Felder aktualisieren, Rest unverändert lassen
      const data: PrismaClient.CustomerUpdateInput = {
        ...dto,
        projectType: dto.projectType ?? undefined,
        interest: dto.interest ?? undefined,
        notes: dto.notes ?? undefined,
        status: dto.status ?? undefined,
        source: dto.source ?? undefined,
        workflowStatus: dto.workflowStatus ?? undefined,
        callCount: dto.callCount ?? undefined,
        voiceMinutes: dto.voiceMinutes ?? undefined,
        automationCoverage: dto.automationCoverage ?? undefined,
        csat: dto.csat ?? undefined
      };

      if (dto.n8nConfig) {
        // Neue n8n Konfiguration mit Defaults zusammenführen
        data.n8nConfig = this.mergeConfig(this.defaultN8nConfig(), dto.n8nConfig);
      }

      if (dto.elevenConfig) {
        // Analog für ElevenLabs Konfiguration
        data.elevenConfig = this.mergeConfig(this.defaultElevenConfig(), dto.elevenConfig);
      }

      if (dto.callCount || dto.voiceMinutes || dto.workflowStatus) {
        // Bei Aktivität den Zeitstempel setzen
        data.lastActivity = new Date();
      }

      return await this.prisma.customer.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Customer ${id} not found`);
      }
      throw error;
    }
  }
}
