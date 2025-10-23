// MetricsController: liefert Dashboard-Kennzahlen und Aktivitätsliste.
import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  // Aggregierte Kennzahlen abrufen
  getOverview() {
    return this.metricsService.getOverview();
  }

  @Get('activity')
  // Letzte Webhook-/Workflow-Einträge (limit optional)
  getActivity(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : undefined;
    return this.metricsService.getActivity(parsed && Number.isFinite(parsed) ? parsed : undefined);
  }
}
