import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch (e) {
      dbOk = false;
    }
    return {
      name: 'WiesLogic Backend',
      version: process.env.npm_package_version || 'dev',
      status: 'ok',
      database: dbOk ? 'up' : 'down',
    };
  }
}

