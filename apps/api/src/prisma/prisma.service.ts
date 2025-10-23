// PrismaService: kapselt PrismaClient und integriert Logging sowie Shutdown-Hooks.
import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Im Development detaillierte Prisma-Logs aktivieren
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected');
  }

  async enableShutdownHooks(app: INestApplication) {
    // Stellt sicher, dass Prisma bei NestJS Shutdown sauber schließt
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

}
