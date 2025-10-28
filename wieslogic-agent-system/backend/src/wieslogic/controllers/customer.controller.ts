import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('api/wieslogic/customers')
export class CustomerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const customers = await this.prisma.customer.findMany({
      select: { id: true, email: true },
      orderBy: { id: 'asc' },
    });
    return customers;
  }

  @Post()
  async create(@Body() body: { id: string; email?: string }) {
    if (!body?.id) {
      return { ok: false, message: 'Missing customer id' };
    }
    const c = await this.prisma.customer.upsert({
      where: { id: body.id },
      update: { email: body.email ?? undefined },
      create: { id: body.id, email: body.email ?? null },
    });
    return { ok: true, customer: { id: c.id, email: c.email } };
  }
}
