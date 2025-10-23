import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.organization.findMany({ where: { tenantId } });
  }

  create(tenantId: string, dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        tenantId,
        name: dto.name,
        industry: dto.industry
      }
    });
  }
}
