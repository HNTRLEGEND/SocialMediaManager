import { Injectable } from '@nestjs/common';
import { CustomerAgentConfigService } from './customer-agent-config.service';
import { SheetMappingService } from './sheet-mapping.service';

@Injectable()
export class AgentOrchestrationService {
  constructor(
    private readonly configService: CustomerAgentConfigService,
    private readonly sheetService: SheetMappingService,
  ) {}

  async getRuntimeContext(customerId: string) {
    const config = await this.configService.getConfig(customerId);
    const sheets = await this.sheetService.getLogicalToActualMap(customerId);
    const activeAgents = await this.configService.getActiveAgents(customerId);
    return {
      customerId,
      config,
      sheets,
      activeAgents,
    };
  }
}

