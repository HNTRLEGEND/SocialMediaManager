import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TerminusModule } from '@nestjs/terminus';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AgentsModule } from './modules/agents/agents.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BillingModule } from './modules/billing/billing.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AdminModule } from './modules/admin/admin.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { AuditModule } from './modules/audit/audit.module';
import { ActivityInterceptor } from './common/interceptors/activity.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TerminusModule,
    EventEmitterModule.forRoot({}),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    AgentsModule,
    WorkflowsModule,
    DashboardModule,
    BillingModule,
    WebhooksModule,
    TelemetryModule,
    AuditModule,
    AdminModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor
    }
  ]
})
export class AppModule {}
