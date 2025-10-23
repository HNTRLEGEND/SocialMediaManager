import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected');
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  withTenant<T>(tenantId: string, callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    if (!tenantId) {
      throw new Error('tenantId is required for tenant-scoped queries');
    }

    return this.$transaction(async (tx) => {
      await tx.$executeRaw(Prisma.sql`SET app.current_tenant = ${tenantId}`);
      try {
        return await callback(tx);
      } finally {
        await tx.$executeRaw(Prisma.sql`RESET app.current_tenant`);
      }
    });
  }
}
