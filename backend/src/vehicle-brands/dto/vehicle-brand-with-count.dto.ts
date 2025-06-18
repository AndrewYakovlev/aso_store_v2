import { ApiProperty } from '@nestjs/swagger';
import { VehicleBrandDto } from './vehicle-brand.dto';

export class VehicleBrandWithCountDto extends VehicleBrandDto {
  @ApiProperty({ description: 'Количество моделей марки' })
  modelsCount: number;
}
