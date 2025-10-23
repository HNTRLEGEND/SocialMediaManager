import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Controller('workflows')
@UseGuards(TenantGuard)
export class WorkflowsController {
  constructor(private readonly workflows: WorkflowsService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.workflows.findAll(tenantId);
  }

  @Post()
  create(@Tenant() tenantId: string, @Body() body: CreateWorkflowDto) {
    return this.workflows.create(tenantId, body);
  }
}
