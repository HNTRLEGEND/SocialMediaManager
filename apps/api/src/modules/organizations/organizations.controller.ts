import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
@UseGuards(TenantGuard)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.organizations.findAll(tenantId);
  }

  @Post()
  create(@Tenant() tenantId: string, @Body() body: CreateOrganizationDto) {
    return this.organizations.create(tenantId, body);
  }
}
