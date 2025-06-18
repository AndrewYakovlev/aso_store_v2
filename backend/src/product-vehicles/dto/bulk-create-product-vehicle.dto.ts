import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateProductVehicleDto } from './create-product-vehicle.dto';

export class BulkCreateProductVehicleDto {
  @ApiProperty({
    description: 'Массив связей с автомобилями',
    type: [CreateProductVehicleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVehicleDto)
  vehicles: CreateProductVehicleDto[];
}
