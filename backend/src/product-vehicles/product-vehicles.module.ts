import { Module } from '@nestjs/common';
import { ProductVehiclesService } from './product-vehicles.service';
import { ProductVehiclesController } from './product-vehicles.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProductVehiclesService],
  controllers: [ProductVehiclesController],
  exports: [ProductVehiclesService],
})
export class ProductVehiclesModule {}
