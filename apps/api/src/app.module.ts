import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ConfigsModule } from './modules/configs/configs.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    CustomersModule,
    ConfigsModule,
    MetricsModule,
    WebhooksModule
  ]
})
export class AppModule {}
