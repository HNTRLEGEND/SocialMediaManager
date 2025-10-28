import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertProductCatalogDto {
  category: string;
  enabled?: boolean;
  models: string[];
  calculationModule: string;
  basePricing?: Record<string, any>;
  discountRules?: Record<string, any>;
}

@Injectable()
export class ProductCatalogService {
  constructor(private prisma: PrismaService) {}

  async upsertCategory(customerId: string, dto: UpsertProductCatalogDto) {
    return this.prisma.productCatalogConfig.upsert({
      where: { customerId_category: { customerId, category: dto.category } },
      update: {
        enabled: dto.enabled ?? true,
        models: dto.models as any,
        calculationModule: dto.calculationModule,
        basePricing: dto.basePricing as any,
        discountRules: dto.discountRules as any,
      },
      create: {
        customerId,
        category: dto.category,
        enabled: dto.enabled ?? true,
        models: dto.models as any,
        calculationModule: dto.calculationModule,
        basePricing: dto.basePricing as any,
        discountRules: dto.discountRules as any,
      },
    });
  }

  async listCategories(customerId: string) {
    return this.prisma.productCatalogConfig.findMany({ where: { customerId } });
  }
}

