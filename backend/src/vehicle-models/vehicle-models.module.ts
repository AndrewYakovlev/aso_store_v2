import { Module } from '@nestjs/common';
import { VehicleModelsService } from './vehicle-models.service';
import { VehicleModelsController } from './vehicle-models.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleModelsService],
  controllers: [VehicleModelsController],
  exports: [VehicleModelsService],
})
export class VehicleModelsModule {}
