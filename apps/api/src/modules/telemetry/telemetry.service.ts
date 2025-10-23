import { Injectable } from '@nestjs/common';

@Injectable()
export class TelemetryService {
  generateSnapshot(tenantId: string) {
    return {
      tenantId,
      callsPerMinute: Math.floor(Math.random() * 10) + 30,
      uptime: 99.9,
      csat: 4.8,
      timestamp: new Date().toISOString()
    };
  }
}
