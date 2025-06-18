import { ApiProperty } from '@nestjs/swagger';
import { VehicleBrandDto } from '../../vehicle-brands/dto';

export class VehicleModelDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  brandId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameCyrillic: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ description: 'Класс автомобиля (A, B, C, D, E, S и т.д.)' })
  class: string;

  @ApiProperty({ description: 'Год начала производства' })
  yearFrom: number;

  @ApiProperty({ description: 'Год окончания производства', required: false })
  yearTo?: number;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => VehicleBrandDto, required: false })
  brand?: VehicleBrandDto;
}
