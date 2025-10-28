import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertSheetMappingDto {
  logicalName: string;
  actualSheetName: string;
}

@Injectable()
export class SheetMappingService {
  constructor(private prisma: PrismaService) {}

  async getMappingsForCustomer(customerId: string) {
    return this.prisma.sheetMapping.findMany({ where: { customerId } });
  }

  async getLogicalToActualMap(customerId: string): Promise<Record<string, string>> {
    const rows = await this.getMappingsForCustomer(customerId);
    return rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.logicalName] = row.actualSheetName;
      return acc;
    }, {});
  }

  async setMapping(customerId: string, dto: UpsertSheetMappingDto) {
    return this.prisma.sheetMapping.upsert({
      where: { customerId_logicalName: { customerId, logicalName: dto.logicalName } },
      update: { actualSheetName: dto.actualSheetName },
      create: {
        customerId,
        logicalName: dto.logicalName,
        actualSheetName: dto.actualSheetName,
      },
    });
  }
}

