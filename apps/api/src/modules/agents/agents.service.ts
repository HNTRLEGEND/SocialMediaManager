import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.agent.findMany({ where: { tenantId }, include: { project: true } });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.agent.findFirst({ where: { tenantId, id }, include: { project: true } });
  }

  create(tenantId: string, dto: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        projectId: dto.projectId,
        guardrails: dto.guardrails ?? {}
      }
    });
  }
}
