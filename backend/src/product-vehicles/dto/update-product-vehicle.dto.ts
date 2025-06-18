import { PartialType } from '@nestjs/swagger';
import { CreateProductVehicleDto } from './create-product-vehicle.dto';

export class UpdateProductVehicleDto extends PartialType(
  CreateProductVehicleDto,
) {}
