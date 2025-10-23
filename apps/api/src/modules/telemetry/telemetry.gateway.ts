import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TelemetryService } from './telemetry.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TelemetryGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly telemetry: TelemetryService) {}

  handleConnection() {
    this.logger.log('Client connected');
  }

  handleDisconnect() {
    this.logger.log('Client disconnected');
  }

  emitSnapshot(tenantId: string) {
    const snapshot = this.telemetry.generateSnapshot(tenantId);
    this.server.to(tenantId).emit('telemetry.snapshot', snapshot);
  }
}
