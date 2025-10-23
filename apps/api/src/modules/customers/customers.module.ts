// CustomersModule: bündelt Controller und Service rund um Kundendaten.
import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class CustomersModule {}
