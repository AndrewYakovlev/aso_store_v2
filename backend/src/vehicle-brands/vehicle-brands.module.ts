import { Module } from '@nestjs/common';
import { VehicleBrandsService } from './vehicle-brands.service';
import { VehicleBrandsController } from './vehicle-brands.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleBrandsService],
  controllers: [VehicleBrandsController],
  exports: [VehicleBrandsService],
})
export class VehicleBrandsModule {}
