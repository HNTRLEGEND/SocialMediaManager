import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
@UseGuards(TenantGuard)
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.agents.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.agents.findOne(tenantId, id);
  }

  @Post()
  create(@Tenant() tenantId: string, @Body() body: CreateAgentDto) {
    return this.agents.create(tenantId, body);
  }
}
