import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(TenantGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.projects.findAll(tenantId);
  }

  @Post()
  create(@Tenant() tenantId: string, @Body() body: CreateProjectDto) {
    return this.projects.create(tenantId, body);
  }
}
