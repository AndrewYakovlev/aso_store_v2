import { ApiProperty } from '@nestjs/swagger';
import { VehicleBrandWithCountDto } from './vehicle-brand-with-count.dto';

export class PaginatedVehicleBrandsDto {
  @ApiProperty({ type: [VehicleBrandWithCountDto] })
  items: VehicleBrandWithCountDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
