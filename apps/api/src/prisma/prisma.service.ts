import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

  withTenant<T>(tenantId: string, callback: () => Promise<T>) {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET app.current_tenant = '${tenantId}'`);
      try {
        return await callback();
      } finally {
        await tx.$executeRawUnsafe('RESET app.current_tenant');
      }
    });
  }
}
