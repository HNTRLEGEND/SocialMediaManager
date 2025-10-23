// CustomersController: REST-Endpunkte für Leads und Kunden.
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  // Neuen Kunden bzw. Lead anlegen
  create(@Body() body: CreateCustomerDto) {
    return this.customersService.create(body);
  }

  @Get()
  // Alle Kunden chronologisch sortiert zurückgeben
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  // Einzelnen Kunden inkl. Fehlermeldung, falls nicht vorhanden, laden
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  // Kundeninformationen aktualisieren
  update(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customersService.update(id, body);
  }
}
