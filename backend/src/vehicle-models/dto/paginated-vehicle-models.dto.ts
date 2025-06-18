import { ApiProperty } from '@nestjs/swagger';
import { VehicleModelDto } from './vehicle-model.dto';

export class PaginatedVehicleModelsDto {
  @ApiProperty({ type: [VehicleModelDto] })
  items: VehicleModelDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
